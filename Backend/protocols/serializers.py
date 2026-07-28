from rest_framework import serializers
from .models import Protocol, ExerciseModule


class ExerciseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseModule
        fields = ['id', 'name', 'muscle_group', 'order', 'sets', 'reps', 'target_weight_kg']


class ProtocolReadSerializer(serializers.ModelSerializer):
    modules = ExerciseModuleSerializer(many=True, read_only=True)
    created_by_alias = serializers.CharField(source='created_by.alias', read_only=True)
    module_count = serializers.SerializerMethodField()

    class Meta:
        model = Protocol
        fields = [
            'id', 'name', 'stimulus_type', 'status',
            'estimated_duration_min', 'metabolic_load_kcal',
            'created_by', 'created_by_alias',
            'modules', 'module_count', 'updated_at',
        ]

    def get_module_count(self, obj) -> int:
        return obj.modules.count()


class ProtocolWriteSerializer(serializers.ModelSerializer):
    modules = ExerciseModuleSerializer(many=True, required=False)

    class Meta:
        model = Protocol
        fields = [
            'name', 'stimulus_type', 'status',
            'estimated_duration_min', 'metabolic_load_kcal',
            'modules',
        ]

    def create(self, validated_data):
        modules_data = validated_data.pop('modules', [])
        protocol = Protocol.objects.create(**validated_data)
        for module_data in modules_data:
            ExerciseModule.objects.create(protocol=protocol, **module_data)
        return protocol

    def update(self, instance, validated_data):
        modules_data = validated_data.pop('modules', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if modules_data is not None:
            instance.modules.all().delete()
            for module_data in modules_data:
                ExerciseModule.objects.create(protocol=instance, **module_data)
        return instance
