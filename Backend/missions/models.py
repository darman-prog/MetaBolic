from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class MissionPriority(models.TextChoices):
    ALTO = 'ALTO', 'Alto'
    MEDIO = 'MEDIO', 'Medio'
    BAJO = 'BAJO', 'Bajo'


class MissionType(models.TextChoices):
    EJERCICIO = 'EJERCICIO', 'Ejercicio'
    HIDRATACION = 'HIDRATACION', 'Hidratación'
    SUEÑO = 'SUENO', 'Sueño'
    CUSTOM = 'CUSTOM', 'Custom'


class MissionStatus(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    EN_PROGRESO = 'EN_PROGRESO', 'En Progreso'
    COMPLETADA = 'COMPLETADA', 'Completada'


class Mission(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=MissionPriority.choices, default=MissionPriority.MEDIO)
    mission_type = models.CharField(max_length=20, choices=MissionType.choices, default=MissionType.EJERCICIO)
    xp_reward = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
    )
    current_progress = models.PositiveIntegerField(default=0)
    goal = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=MissionStatus.choices, default=MissionStatus.PENDIENTE)
    deadline = models.DateField(null=True, blank=True)
    operator = models.ForeignKey(
        'accounts.OperatorProfile',
        on_delete=models.CASCADE,
        related_name='missions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} [{self.get_status_display()}]'
