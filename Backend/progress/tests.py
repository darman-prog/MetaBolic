from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import ProgressEntry, MuscleGroupVolume
from training.models import TrainingSession


class ProgressTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('testop', password='StrongPass123!')
        self.profile = self.user.operator_profile
        response = self.client.post('/api/auth/login/', {
            'username': 'testop', 'password': 'StrongPass123!'
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

    def test_volume_by_group_date_filter(self):
        session_jan = TrainingSession.objects.create(
            operator=self.profile, date='2026-01-15',
            actual_duration_min=30, total_load_kg=1000
        )
        session_jul = TrainingSession.objects.create(
            operator=self.profile, date='2026-07-28',
            actual_duration_min=45, total_load_kg=2000
        )
        MuscleGroupVolume.objects.create(session=session_jan, muscle_group='PUSH', volume_kg=100)
        MuscleGroupVolume.objects.create(session=session_jul, muscle_group='PUSH', volume_kg=300)
        response = self.client.get('/api/progress/volume_by_group/?date_from=2026-07-01&date_to=2026-07-31')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        push = next(item for item in response.data if item['muscle_group'] == 'PUSH')
        self.assertEqual(float(push['total_volume']), 300.0)
