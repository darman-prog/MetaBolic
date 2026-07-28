from rest_framework import serializers
from .models import TrainingSession


class TrainingSessionReadSerializer(serializers.ModelSerializer):
    operator_alias = serializers.CharField(source='operator.alias', read_only=True)
    protocol_name = serializers.CharField(source='protocol.name', read_only=True, allow_null=True)

    class Meta:
        model = TrainingSession
        fields = [
            'id', 'operator', 'operator_alias',
            'protocol', 'protocol_name',
            'date', 'actual_duration_min',
            'total_load_kg', 'estimated_calories', 'notes',
        ]


class TrainingSessionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSession
        fields = [
            'protocol', 'date', 'actual_duration_min',
            'total_load_kg', 'estimated_calories', 'notes',
        ]
