from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.exceptions import ValidationError


MAX_AVATAR_SIZE_MB = 2
MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024


def validate_avatar_size(file):
    if file.size > MAX_AVATAR_SIZE_BYTES:
        raise ValidationError(f'Avatar must be under {MAX_AVATAR_SIZE_MB}MB.')


XP_PER_LEVEL = 100


class Rank(models.TextChoices):
    NOVATO = 'NOVATO', 'Novato'
    VANGUARD = 'VANGUARD', 'Vanguard'
    ALPHA = 'ALPHA', 'Alpha'
    ELITE = 'ELITE', 'Elite'
    LEGEND = 'LEGEND', 'Legend'


RANK_BY_LEVEL = [
    (10, Rank.VANGUARD),
    (20, Rank.ALPHA),
    (30, Rank.ELITE),
    (40, Rank.LEGEND),
]


class OperatorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='operator_profile')
    alias = models.CharField(max_length=50, unique=True)
    rank = models.CharField(max_length=20, choices=Rank.choices, default=Rank.NOVATO)
    level = models.PositiveIntegerField(default=1)
    xp_total = models.PositiveIntegerField(default=0)
    height_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    current_weight_kg = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, validators=[validate_avatar_size])
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
        self.rank = self._rank_for_level(self.level)
        self.save(update_fields=['xp_total', 'level', 'rank'])

    def _rank_for_level(self, level: int):
        for threshold, rank in RANK_BY_LEVEL:
            if level >= threshold:
                return rank
        return Rank.NOVATO


@receiver(post_save, sender=User)
def create_or_update_operator_profile(sender, instance, created, **kwargs):
    if created:
        OperatorProfile.objects.create(
            user=instance,
            alias=f'OPERATOR_{instance.id:03d}'
        )
    instance.operator_profile.save()


@receiver(post_save, sender=OperatorProfile)
def sync_weight_to_progress_entry(sender, instance, created, update_fields, **kwargs):
    """
    Cuando `current_weight_kg` cambia, crea o actualiza un ProgressEntry del día
    para mantener el historial de progreso sincronizado.
    """
    if instance.current_weight_kg is None:
        return
    if update_fields is not None and 'current_weight_kg' not in update_fields:
        return
    # Importación lazy para evitar circular imports
    from progress.models import ProgressEntry
    ProgressEntry.objects.update_or_create(
        operator=instance,
        date=timezone.now().date(),
        defaults={'weight_kg': instance.current_weight_kg}
    )
