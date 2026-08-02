from datetime import timedelta
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User
from django.conf import settings as django_settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import RegisterSerializer, OperatorProfileReadSerializer, OperatorProfileWriteSerializer, LogoutSerializer
from .throttling import LoginRateThrottle, RegisterRateThrottle, JWTRateThrottle


COOKIE_NAME = django_settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token")


def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=not django_settings.DEBUG,
        samesite="Lax",
        max_age=timedelta(days=7),
        path="/api/auth/",
    )


def _delete_refresh_cookie(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/api/auth/")


class LoginView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.get('refresh')
        if refresh:
            _set_refresh_cookie(response, refresh)
            response.data.pop('refresh', None)
        return response


class RefreshTokenView(TokenRefreshView):
    throttle_classes = [JWTRateThrottle]

    def post(self, request, *args, **kwargs):
        cookie_token = request.COOKIES.get(COOKIE_NAME)
        if cookie_token and 'refresh' not in (request.data or {}):
            if hasattr(request.data, '_mutable'):
                request.data._mutable = True
                request.data['refresh'] = cookie_token
                request.data._mutable = False
            else:
                request.data['refresh'] = cookie_token
        response = super().post(request, *args, **kwargs)
        refresh = response.data.get('refresh')
        if refresh:
            _set_refresh_cookie(response, refresh)
            response.data.pop('refresh', None)
        return response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            OperatorProfileReadSerializer(user.operator_profile).data,
            status=status.HTTP_201_CREATED,
        )


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = []
    serializer_class = LogoutSerializer

    def post(self, request):
        refresh = request.data.get('refresh') or request.COOKIES.get(COOKIE_NAME)
        if not refresh:
            response = Response(status=status.HTTP_204_NO_CONTENT)
            _delete_refresh_cookie(response)
            return response
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError:
            response = Response(status=status.HTTP_204_NO_CONTENT)
            _delete_refresh_cookie(response)
            return response
        response = Response(status=status.HTTP_204_NO_CONTENT)
        _delete_refresh_cookie(response)
        return response


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OperatorProfileReadSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return OperatorProfileWriteSerializer
        return OperatorProfileReadSerializer

    def get_object(self):
        return self.request.user.operator_profile
