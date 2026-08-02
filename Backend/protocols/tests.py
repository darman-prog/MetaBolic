from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Protocol, ExerciseModule


class ProtocolTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('testop', password='StrongPass123!')
        self.profile = self.user.operator_profile
        response = self.client.post('/api/auth/login/', {
            'username': 'testop', 'password': 'StrongPass123!'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_protocol(self):
        data = {
            'name': 'ALPHA-7',
            'stimulus_type': 'HIPERTROFIA',
            'status': 'ALPHA',
            'estimated_duration_min': 60,
            'modules': [
                {'name': 'PRESS_BANCA', 'muscle_group': 'PUSH', 'order': 1, 'sets': 4, 'reps': 10, 'target_weight_kg': 80},
                {'name': 'REMO_POLIA', 'muscle_group': 'PULL', 'order': 2, 'sets': 4, 'reps': 10, 'target_weight_kg': 60},
            ]
        }
        response = self.client.post('/api/protocols/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Protocol.objects.count(), 1)
        self.assertEqual(ExerciseModule.objects.count(), 2)

    def test_list_protocols(self):
        Protocol.objects.create(
            name='TEST', stimulus_type='FUERZA_MAX', estimated_duration_min=45,
            created_by=self.profile
        )
        response = self.client.get('/api/protocols/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_protocol_unauthenticated(self):
        self.client.credentials()
        data = {'name': 'TEST', 'stimulus_type': 'FUERZA_MAX', 'estimated_duration_min': 45}
        response = self.client.post('/api/protocols/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
