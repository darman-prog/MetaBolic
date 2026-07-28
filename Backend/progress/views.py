from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import ProgressEntry, MuscleGroupVolume
from .serializers import (
    ProgressEntryReadSerializer,
    ProgressEntryWriteSerializer,
    MuscleGroupVolumeSerializer,
)
from training.models import TrainingSession


class ProgressEntryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PUT', 'PATCH'):
            return ProgressEntryWriteSerializer
        return ProgressEntryReadSerializer

    def get_queryset(self):
        return ProgressEntry.objects.filter(operator=self.request.user.operator_profile)

    def perform_create(self, serializer):
        serializer.save(operator=self.request.user.operator_profile)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        profile = request.user.operator_profile
        sessions = TrainingSession.objects.filter(operator=profile)
        total_sessions = sessions.count()
        total_load = sessions.aggregate(s=Sum('total_load_kg'))['s'] or 0
        total_calories = sessions.aggregate(c=Sum('estimated_calories'))['c'] or 0
        completed_missions = profile.missions.filter(status='COMPLETADA').count()
        streak = self._calculate_streak(sessions)
        return Response({
            'total_sessions': total_sessions,
            'total_load_kg': total_load,
            'total_calories': total_calories,
            'completed_missions': completed_missions,
            'current_streak_days': streak,
            'xp_total': profile.xp_total,
            'level': profile.level,
        })

    @action(detail=False, methods=['get'])
    def volume_by_group(self, request):
        profile = request.user.operator_profile
        session_ids = TrainingSession.objects.filter(operator=profile).values_list('id', flat=True)
        volumes = (
            MuscleGroupVolume.objects
            .filter(session_id__in=session_ids)
            .values('muscle_group')
            .annotate(total_volume=Sum('volume_kg'))
        )
        return Response(volumes)

    def _calculate_streak(self, sessions):
        if not sessions.exists():
            return 0
        dates = sorted(set(sessions.values_list('date', flat=True)), reverse=True)
        streak = 0
        today = timezone.now().date()
        expected = today
        for d in dates:
            if d == expected or d == expected - timedelta(days=1):
                streak += 1
                expected = d - timedelta(days=1)
            elif d < expected - timedelta(days=1):
                break
        return streak
