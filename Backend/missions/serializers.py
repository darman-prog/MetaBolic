from rest_framework import serializers
from .models import Mission


class MissionReadSerializer(serializers.ModelSerializer):
    operator_alias = serializers.CharField(source='operator.alias', read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Mission
        fields = [
            'id', 'title', 'description', 'priority', 'mission_type',
            'xp_reward', 'current_progress', 'goal', 'progress_percent',
            'status', 'deadline', 'operator', 'operator_alias',
            'created_at', 'completed_at',
        ]

    def get_progress_percent(self, obj) -> int:
        if obj.goal == 0:
            return 0
        return min(100, int((obj.current_progress / obj.goal) * 100))


class MissionWriteSerializer(serializers.ModelSerializer):
    xp_reward = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=100,
    )

    class Meta:
        model = Mission
        fields = [
            'title', 'description', 'priority', 'mission_type',
            'xp_reward', 'current_progress', 'goal',
            'status', 'deadline',
        ]
