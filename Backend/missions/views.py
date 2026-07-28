from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Mission, MissionStatus
from .serializers import MissionReadSerializer, MissionWriteSerializer


class MissionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PUT', 'PATCH'):
            return MissionWriteSerializer
        return MissionReadSerializer

    def get_queryset(self):
        return Mission.objects.filter(operator=self.request.user.operator_profile)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(operator=request.user.operator_profile)
        return Response(
            MissionReadSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        mission = self.get_object()
        mission.status = MissionStatus.COMPLETADA
        mission.completed_at = timezone.now()
        mission.current_progress = mission.goal
        mission.save()
        profile = request.user.operator_profile
        profile.add_xp(mission.xp_reward)
        return Response(MissionReadSerializer(mission).data, status=status.HTTP_200_OK)
