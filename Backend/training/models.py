from django.db import models


class TrainingSession(models.Model):
    operator = models.ForeignKey(
        'accounts.OperatorProfile',
        on_delete=models.CASCADE,
        related_name='training_sessions'
    )
    protocol = models.ForeignKey(
        'protocols.Protocol',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    date = models.DateField()
    actual_duration_min = models.PositiveIntegerField()
    total_load_kg = models.DecimalField(max_digits=8, decimal_places=1, default=0)
    estimated_calories = models.DecimalField(max_digits=7, decimal_places=1, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'Session {self.date} - {self.operator.alias}'
