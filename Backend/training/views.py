from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TrainingSession
from .serializers import TrainingSessionReadSerializer, TrainingSessionWriteSerializer
from progress.models import MuscleGroupVolume
from progress.serializers import MuscleGroupVolumeSerializer


class TrainingSessionViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PUT', 'PATCH'):
            return TrainingSessionWriteSerializer
        return TrainingSessionReadSerializer

    def get_queryset(self):
        qs = TrainingSession.objects.filter(
            operator=self.request.user.operator_profile
        ).select_related('operator', 'protocol')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(operator=self.request.user.operator_profile)

    @action(detail=True, methods=['get', 'post'])
    def volume(self, request, pk=None):
        session = self.get_object()
        if request.method == 'GET':
            volumes = session.volume_by_group.all()
            return Response(MuscleGroupVolumeSerializer(volumes, many=True).data)
        serializer = MuscleGroupVolumeSerializer(data=request.data, many=isinstance(request.data, list))
        serializer.is_valid(raise_exception=True)
        if isinstance(request.data, list):
            session.volume_by_group.all().delete()
            for item in serializer.validated_data:
                MuscleGroupVolume.objects.create(session=session, **item)
        else:
            MuscleGroupVolume.objects.create(session=session, **serializer.validated_data)
        return Response(
            MuscleGroupVolumeSerializer(session.volume_by_group.all(), many=True).data,
            status=201,
        )
