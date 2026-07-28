from rest_framework import serializers
from .models import ProgressEntry, MuscleGroupVolume


class ProgressEntryReadSerializer(serializers.ModelSerializer):
    operator_alias = serializers.CharField(source='operator.alias', read_only=True)

    class Meta:
        model = ProgressEntry
        fields = [
            'id', 'operator', 'operator_alias',
            'date', 'weight_kg', 'body_fat_percentage', 'measurements',
        ]


class ProgressEntryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressEntry
        fields = ['date', 'weight_kg', 'body_fat_percentage', 'measurements']

    def validate_weight_kg(self, value):
        if value < 30 or value > 250:
            raise serializers.ValidationError('Weight must be between 30 and 250 kg.')
        return value


class MuscleGroupVolumeSerializer(serializers.ModelSerializer):
    muscle_group_display = serializers.CharField(source='get_muscle_group_display', read_only=True)

    class Meta:
        model = MuscleGroupVolume
        fields = ['id', 'session', 'muscle_group', 'muscle_group_display', 'volume_kg']
