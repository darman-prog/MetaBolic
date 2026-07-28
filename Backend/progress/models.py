from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from protocols.models import MuscleGroup


class ProgressEntry(models.Model):
    operator = models.ForeignKey(
        'accounts.OperatorProfile',
        on_delete=models.CASCADE,
        related_name='progress_entries'
    )
    date = models.DateField()
    weight_kg = models.DecimalField(
        max_digits=5, decimal_places=1,
        validators=[MinValueValidator(30), MaxValueValidator(250)]
    )
    body_fat_percentage = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    measurements = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'Progress entries'
        ordering = ['-date']
        unique_together = ['operator', 'date']

    def __str__(self):
        return f'{self.operator.alias} - {self.date}: {self.weight_kg}kg'


class MuscleGroupVolume(models.Model):
    session = models.ForeignKey(
        'training.TrainingSession',
        on_delete=models.CASCADE,
        related_name='volume_by_group'
    )
    muscle_group = models.CharField(max_length=20, choices=MuscleGroup.choices)
    volume_kg = models.DecimalField(max_digits=8, decimal_places=1)

    class Meta:
        verbose_name_plural = 'Muscle group volumes'
        unique_together = ['session', 'muscle_group']

    def __str__(self):
        return f'{self.get_muscle_group_display()}: {self.volume_kg}kg'
