from rest_framework import viewsets, permissions
from .models import Protocol, ExerciseModule
from .serializers import ProtocolReadSerializer, ProtocolWriteSerializer, ExerciseModuleSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


class ProtocolViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PUT', 'PATCH'):
            return ProtocolWriteSerializer
        return ProtocolReadSerializer

    def get_queryset(self):
        return Protocol.objects.filter(created_by=self.request.user.operator_profile)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.operator_profile)

    @action(detail=True, methods=['get', 'post'])
    def modules(self, request, pk=None):
        protocol = self.get_object()
        if request.method == 'GET':
            modules = protocol.modules.all()
            serializer = ExerciseModuleSerializer(modules, many=True)
            return Response(serializer.data)
        serializer = ExerciseModuleSerializer(data=request.data, many=isinstance(request.data, list))
        serializer.is_valid(raise_exception=True)
        if isinstance(request.data, list):
            protocol.modules.all().delete()
            for item in serializer.validated_data:
                ExerciseModule.objects.create(protocol=protocol, **item)
        else:
            ExerciseModule.objects.create(protocol=protocol, **serializer.validated_data)
        return Response(
            ExerciseModuleSerializer(protocol.modules.all(), many=True).data,
            status=201,
        )
