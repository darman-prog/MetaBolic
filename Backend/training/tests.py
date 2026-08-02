from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import TrainingSession
from protocols.models import Protocol


class SessionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('testop', password='StrongPass123!')
        self.profile = self.user.operator_profile
        response = self.client.post('/api/auth/login/', {
            'username': 'testop', 'password': 'StrongPass123!'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_session(self):
        data = {
            'date': '2026-07-28',
            'actual_duration_min': 60,
            'total_load_kg': 5000,
            'estimated_calories': 450,
        }
        response = self.client.post('/api/sessions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TrainingSession.objects.count(), 1)

    def test_filter_sessions_by_date(self):
        TrainingSession.objects.create(
            operator=self.profile, date='2026-07-20', actual_duration_min=30
        )
        TrainingSession.objects.create(
            operator=self.profile, date='2026-07-25', actual_duration_min=45
        )
        response = self.client.get('/api/sessions/?date_from=2026-07-22&date_to=2026-07-28')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_update_session_allowed(self):
        session = TrainingSession.objects.create(
            operator=self.profile, date='2026-07-28', actual_duration_min=45
        )
        response = self.client.patch(f'/api/sessions/{session.id}/', {'actual_duration_min': 60}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session.refresh_from_db()
        self.assertEqual(session.actual_duration_min, 60)

    def test_delete_session_allowed(self):
        session = TrainingSession.objects.create(
            operator=self.profile, date='2026-07-28', actual_duration_min=45
        )
        response = self.client.delete(f'/api/sessions/{session.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TrainingSession.objects.count(), 0)
