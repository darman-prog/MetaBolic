from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class StimulusType(models.TextChoices):
    FUERZA_MAX = 'FUERZA_MAX', 'Fuerza Máxima'
    HIPERTROFIA = 'HIPERTROFIA', 'Hipertrofia'
    RESISTENCIA = 'RESISTENCIA', 'Resistencia'
    POTENCIA = 'POTENCIA', 'Potencia'
    RESISTENCIA_MUSCULAR = 'RESISTENCIA_MUSCULAR', 'Resistencia Muscular'


class ProtocolStatus(models.TextChoices):
    ALPHA = 'ALPHA', 'Alpha'
    STABLE = 'STABLE', 'Stable'
    BETA = 'BETA', 'Beta'


class MuscleGroup(models.TextChoices):
    PUSH = 'PUSH', 'Push'
    PULL = 'PULL', 'Pull'
    CORE = 'CORE', 'Core'
    LEGS = 'LEGS', 'Legs'
    FULL_BODY = 'FULL_BODY', 'Full Body'


class Protocol(models.Model):
    name = models.CharField(max_length=100)
    stimulus_type = models.CharField(max_length=30, choices=StimulusType.choices)
    status = models.CharField(max_length=10, choices=ProtocolStatus.choices, default=ProtocolStatus.BETA)
    estimated_duration_min = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(300)]
    )
    metabolic_load_kcal = models.DecimalField(max_digits=7, decimal_places=1, null=True, blank=True)
    created_by = models.ForeignKey(
        'accounts.OperatorProfile',
        on_delete=models.CASCADE,
        related_name='protocols'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.name} ({self.get_stimulus_type_display()})'


class ExerciseModule(models.Model):
    name = models.CharField(max_length=100)
    muscle_group = models.CharField(max_length=20, choices=MuscleGroup.choices)
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE, related_name='modules')
    order = models.PositiveIntegerField()
    sets = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])
    reps = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    target_weight_kg = models.DecimalField(max_digits=6, decimal_places=1)

    class Meta:
        ordering = ['order']
        unique_together = ['protocol', 'order']

    def __str__(self):
        return f'{self.order}. {self.name}'
