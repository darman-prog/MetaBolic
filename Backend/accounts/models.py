from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


XP_PER_LEVEL = 100


class Rank(models.TextChoices):
    NOVATO = 'NOVATO', 'Novato'
    VANGUARD = 'VANGUARD', 'Vanguard'
    ALPHA = 'ALPHA', 'Alpha'
    ELITE = 'ELITE', 'Elite'
    LEGEND = 'LEGEND', 'Legend'


class OperatorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='operator_profile')
    alias = models.CharField(max_length=50, unique=True)
    rank = models.CharField(max_length=20, choices=Rank.choices, default=Rank.NOVATO)
    level = models.PositiveIntegerField(default=1)
    xp_total = models.PositiveIntegerField(default=0)
    height_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    current_weight_kg = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Operator Profile'
        verbose_name_plural = 'Operator Profiles'

    def __str__(self):
        return self.alias or self.user.username

    def add_xp(self, amount: int):
        self.xp_total += amount
        new_level = (self.xp_total // XP_PER_LEVEL) + 1
        if new_level > self.level:
            self.level = new_level
        self.save(update_fields=['xp_total', 'level'])


@receiver(post_save, sender=User)
def create_or_update_operator_profile(sender, instance, created, **kwargs):
    if created:
        OperatorProfile.objects.create(
            user=instance,
            alias=f'OPERATOR_{instance.id:03d}'
        )
    instance.operator_profile.save()
