from rest_framework import serializers
from django.contrib.auth.models import User
from .models import OperatorProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    alias = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'alias']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_alias(self, value):
        if value and OperatorProfile.objects.filter(alias=value).exists():
            raise serializers.ValidationError('This alias is already in use.')
        return value

    def create(self, validated_data):
        alias = validated_data.pop('alias', None)
        user = User.objects.create_user(**validated_data)
        if alias:
            user.operator_profile.alias = alias
            user.operator_profile.save()
        return user


class OperatorProfileReadSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = OperatorProfile
        fields = [
            'id', 'alias', 'rank', 'level', 'xp_total',
            'height_cm', 'current_weight_kg', 'avatar',
            'username', 'email', 'created_at',
        ]


class OperatorProfileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorProfile
        fields = [
            'alias', 'height_cm', 'current_weight_kg', 'avatar',
        ]

    def validate_height_cm(self, value):
        if value is not None and (value < 100 or value > 250):
            raise serializers.ValidationError('Height must be between 100 and 250 cm.')
        return value

    def validate_current_weight_kg(self, value):
        if value is not None and (value < 30 or value > 250):
            raise serializers.ValidationError('Weight must be between 30 and 250 kg.')
        return value
