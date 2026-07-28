from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import ProgressEntry
from training.models import TrainingSession


class ProgressTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('testop', password='testpass123')
        self.profile = self.user.operator_profile
        response = self.client.post('/api/auth/login/', {
            'username': 'testop', 'password': 'testpass123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_progress_entry(self):
        data = {'date': '2026-07-28', 'weight_kg': 85.5}
        response = self.client.post('/api/progress/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProgressEntry.objects.count(), 1)

    def test_create_progress_invalid_weight(self):
        data = {'date': '2026-07-28', 'weight_kg': 300}
        response = self.client.post('/api/progress/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_summary_endpoint(self):
        TrainingSession.objects.create(
            operator=self.profile, date='2026-07-28',
            actual_duration_min=45, total_load_kg=3000
        )
        response = self.client.get('/api/progress/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_sessions', response.data)
        self.assertEqual(response.data['total_sessions'], 1)
        self.assertEqual(float(response.data['total_load_kg']), 3000.0)
