from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Mission, MissionStatus


class MissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('testop', password='testpass123')
        self.profile = self.user.operator_profile
        response = self.client.post('/api/auth/login/', {
            'username': 'testop', 'password': 'testpass123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_mission(self):
        data = {
            'title': 'Hidratación matutina',
            'mission_type': 'HIDRATACION',
            'goal': 8,
            'xp_reward': 20,
            'priority': 'ALTO',
        }
        response = self.client.post('/api/missions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['operator_alias'], self.profile.alias)

    def test_complete_mission(self):
        mission = Mission.objects.create(
            title='Test', operator=self.profile, xp_reward=50, goal=1
        )
        response = self.client.post(f'/api/missions/{mission.id}/complete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mission.refresh_from_db()
        self.assertEqual(mission.status, MissionStatus.COMPLETADA)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.xp_total, 50)

    def test_complete_mission_level_up(self):
        self.profile.xp_total = 95
        self.profile.level = 1
        self.profile.save()
        mission = Mission.objects.create(
            title='Level up test', operator=self.profile, xp_reward=10, goal=1
        )
        response = self.client.post(f'/api/missions/{mission.id}/complete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.xp_total, 105)
        self.assertEqual(self.profile.level, 2)

    def test_list_missions_paginated(self):
        for i in range(25):
            Mission.objects.create(title=f'Mission {i}', operator=self.profile, goal=1)
        response = self.client.get('/api/missions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 20)
