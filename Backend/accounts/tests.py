from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.conf import settings as django_settings
from .models import OperatorProfile


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.cookie_name = django_settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token")

    def _login(self, username='testop', password='StrongPass123!'):
        User.objects.create_user(username, password=password)
        return self.client.post(self.login_url, {'username': username, 'password': password}, format='json')

    @staticmethod
    def _extract_refresh(response):
        return response.cookies.get('refresh_token').value if response.cookies.get('refresh_token') else None

    def test_register_success(self):
        data = {'username': 'testop', 'password': 'StrongPass123!', 'email': 'test@metabolic.io'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('alias', response.data)
        self.assertTrue(User.objects.filter(username='testop').exists())

    def test_register_duplicate_username(self):
        User.objects.create_user('testop', password='StrongPass123!')
        data = {'username': 'testop', 'password': 'StrongPass123!'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_with_alias(self):
        data = {'username': 'testop2', 'password': 'StrongPass123!', 'alias': 'GHOST_42'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['alias'], 'GHOST_42')

    def test_register_duplicate_alias(self):
        User.objects.create_user('user1', password='StrongPass123!')
        profile = User.objects.get(username='user1').operator_profile
        profile.alias = 'ALIAS_UNICO'
        profile.save()
        data = {'username': 'user2', 'password': 'StrongPass123!', 'alias': 'ALIAS_UNICO'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user('testop', password='StrongPass123!')
        data = {'username': 'testop', 'password': 'StrongPass123!'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertNotIn('refresh', response.data)
        self.assertIn(self.cookie_name, response.cookies)

    def test_register_weak_password(self):
        data = {'username': 'weakop', 'password': '12345678'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_blacklists_refresh(self):
        login = self._login()
        refresh = self._extract_refresh(login)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')
        response = self.client.post('/api/auth/logout/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        refresh_response = self.client.post('/api/auth/refresh/', {'refresh': refresh}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_rotates_token(self):
        login = self._login()
        old_refresh = self._extract_refresh(login)
        self.client.cookies[self.cookie_name] = old_refresh
        response = self.client.post('/api/auth/refresh/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertNotIn('refresh', response.data)
        self.assertIn(self.cookie_name, response.cookies)
        new_refresh = response.cookies[self.cookie_name].value
        self.assertNotEqual(new_refresh, old_refresh)
        second_refresh = self.client.post('/api/auth/refresh/', {'refresh': old_refresh}, format='json')
        self.assertEqual(second_refresh.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_rank_promotion_on_xp(self):
        user = User.objects.create_user('testop', password='StrongPass123!')
        profile = user.operator_profile
        profile.add_xp(950)  # enough for level 10
        profile.refresh_from_db()
        self.assertGreaterEqual(profile.level, 10)
        self.assertEqual(profile.rank, 'VANGUARD')


class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('testop', password='StrongPass123!')
        self.profile = self.user.operator_profile
        self.profile.alias = 'OPERATOR_001'
        self.profile.save()
        response = self.client.post('/api/auth/login/', {
            'username': 'testop', 'password': 'StrongPass123!'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_get_profile(self):
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['alias'], 'OPERATOR_001')

    def test_patch_profile(self):
        response = self.client.patch('/api/profile/', {'height_cm': 185}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(float(self.profile.height_cm), 185.0)

    def test_patch_profile_invalid_weight(self):
        response = self.client.patch('/api/profile/', {'current_weight_kg': 999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_access(self):
        self.client.credentials()
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_profile_creates_progress_entry(self):
        from progress.models import ProgressEntry
        response = self.client.patch('/api/profile/', {'current_weight_kg': 82.5}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ProgressEntry.objects.filter(operator=self.profile).count(), 1)
        entry = ProgressEntry.objects.get(operator=self.profile)
        self.assertEqual(float(entry.weight_kg), 82.5)
