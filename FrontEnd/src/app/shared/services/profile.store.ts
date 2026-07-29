import { computed, Injectable, signal } from '@angular/core';
import { OperatorProfileRead } from '../models/domain.models';

/**
 * Store simple basado en Signals para el perfil del operador.
 * Evita prop drilling entre sidebar, dashboard y misiones.
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  readonly profile = signal<OperatorProfileRead | null>(null);
  readonly loaded = signal(false);
  readonly loading = signal(false);

  readonly alias = computed(() => this.profile()?.alias ?? 'OPERATOR_UNKNOWN');
  readonly rank = computed(() => this.profile()?.rank ?? 'NOVATO');
  readonly level = computed(() => this.profile()?.level ?? 1);
  readonly xpTotal = computed(() => this.profile()?.xp_total ?? 0);
  readonly currentWeightKg = computed(() => this.profile()?.current_weight_kg ?? null);
  readonly heightCm = computed(() => this.profile()?.height_cm ?? null);

  set(profile: OperatorProfileRead): void {
    this.profile.set(profile);
    this.loaded.set(true);
    this.loading.set(false);
  }

  clear(): void {
    this.profile.set(null);
    this.loaded.set(false);
    this.loading.set(false);
  }

  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }
}
