from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, OperatorProfileReadSerializer, OperatorProfileWriteSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            OperatorProfileReadSerializer(user.operator_profile).data,
            status=status.HTTP_201_CREATED,
        )


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OperatorProfileReadSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return OperatorProfileWriteSerializer
        return OperatorProfileReadSerializer

    def get_object(self):
        return self.request.user.operator_profile
