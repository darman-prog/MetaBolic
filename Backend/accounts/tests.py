from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import OperatorProfile


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'

    def test_register_success(self):
        data = {'username': 'testop', 'password': 'testpass123', 'email': 'test@metabolic.io'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('alias', response.data)
        self.assertTrue(User.objects.filter(username='testop').exists())

    def test_register_duplicate_username(self):
        User.objects.create_user('testop', password='testpass123')
        data = {'username': 'testop', 'password': 'testpass123'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_with_alias(self):
        data = {'username': 'testop2', 'password': 'testpass123', 'alias': 'GHOST_42'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['alias'], 'GHOST_42')

    def test_register_duplicate_alias(self):
        User.objects.create_user('user1', password='testpass123')
        profile = User.objects.get(username='user1').operator_profile
        profile.alias = 'ALIAS_UNICO'
        profile.save()
        data = {'username': 'user2', 'password': 'testpass123', 'alias': 'ALIAS_UNICO'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user('testop', password='testpass123')
        data = {'username': 'testop', 'password': 'testpass123'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('testop', password='testpass123')
        self.profile = self.user.operator_profile
        self.profile.alias = 'OPERATOR_001'
        self.profile.save()
        response = self.client.post('/api/auth/login/', {
            'username': 'testop', 'password': 'testpass123'
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
