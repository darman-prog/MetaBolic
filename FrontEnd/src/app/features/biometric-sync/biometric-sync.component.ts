import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { MetabolicButtonComponent } from '../../shared/components/metabolic-button/metabolic-button.component';
import { MetabolicCardComponent } from '../../shared/components/metabolic-card/metabolic-card.component';

import { ProfileService } from '../../shared/services/profile.service';
import { ProgressService } from '../../shared/services/domain.services';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'metabolic-biometric-sync',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MetabolicButtonComponent,
    MetabolicCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bio">
      <header class="page-heading">
        <p class="eyebrow">PERFIL_BIOMETRICO // SINCRONIZACION</p>
        <h1>BIOMETRIC_FEED</h1>
        <p>Establezca los parámetros base para el cálculo de telemetría y optimización metabólica.</p>
      </header>

      <div class="bio-grid">
        <metabolic-card accent="cyan">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <label>
              <span>ESTATURA (cm)</span>
              <div class="range-row">
                <input type="range" min="100" max="250" formControlName="height" />
                <output>{{ form.controls.height.value }} CM</output>
              </div>
            </label>

            <label>
              <span>PESO_ACTUAL (kg)</span>
              <div class="range-row">
                <input type="range" min="30" max="250" formControlName="weight" />
                <output>{{ form.controls.weight.value }} KG</output>
              </div>
            </label>

            <div class="metrics">
              <div>
                <span>METABOLIC_EFFICIENCY</span>
                <b>A+</b>
              </div>
              <div>
                <span>THREAT_LEVEL</span>
                <b>04</b>
              </div>
            </div>

            @if (error()) {
              <p class="api-error" role="alert">{{ error() }}</p>
            }

            <button metabolicButton type="submit" [disabled]="loading()" [loading]="loading()">
              {{ loading() ? 'INITIALIZING...' : 'CONFIRMAR_DATOS // INICIALIZAR' }}
            </button>
          </form>
        </metabolic-card>

        <metabolic-card>
          <div class="wireframe" aria-label="Vista previa de biometría" role="img">
            <span class="material-symbols-outlined" aria-hidden="true">vital_signs</span>
            <span>SCANNING_ACTIVE...</span>
            <b>AXIS_Y: {{ form.controls.height.value }} CM</b>
            <b>MASS_X: {{ form.controls.weight.value }} KG</b>
          </div>
        </metabolic-card>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .bio {
      display: grid;
      gap: 28px;
    }

    .page-heading {
      border-left: 4px solid var(--metabolic-primary);
      padding-left: 18px;
    }

    .page-heading h1 {
      margin: 10px 0;
      color: var(--metabolic-text);
      font: 600 clamp(1.7rem, 4vw, 2.5rem) var(--metabolic-font-display);
    }

    .page-heading p:last-child {
      max-width: 680px;
      color: var(--metabolic-text-muted);
      font: 14px/1.7 var(--metabolic-font-data);
    }

    .bio-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 900px) {
      .bio-grid { grid-template-columns: 1fr; }
    }

    form {
      display: grid;
      gap: 32px;
    }

    label {
      display: grid;
      gap: 12px;
      color: var(--metabolic-primary);
      font: 700 11px var(--metabolic-font-data);
      letter-spacing: 0.1em;
    }

    .range-row {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 16px;
    }

    input[type="range"] {
      width: 100%;
      height: 6px;
      background: var(--metabolic-surface-high);
      border-radius: 0;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 28px;
      background: var(--metabolic-primary);
      cursor: pointer;
      border-radius: 2px;
      box-shadow: 0 0 10px var(--metabolic-primary);
      border: 2px solid var(--metabolic-text);
    }

    output {
      color: var(--metabolic-text);
      font: 700 20px var(--metabolic-font-data);
      min-width: 80px;
      text-align: right;
    }

    .metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .metrics > div {
      border: 1px solid var(--metabolic-grid-line);
      background: var(--metabolic-surface-dark);
      padding: 16px;
    }

    .metrics span {
      display: block;
      color: var(--metabolic-text-muted);
      font: 10px var(--metabolic-font-data);
      margin-bottom: 8px;
    }

    .metrics b {
      color: var(--metabolic-primary);
      font: 700 24px var(--metabolic-font-data);
    }

    .api-error {
      margin: 0;
      padding: 12px;
      border-left: 3px solid var(--metabolic-secondary);
      background: rgba(181, 0, 54, 0.12);
      color: var(--metabolic-secondary);
      font: 12px var(--metabolic-font-data);
    }

    .wireframe {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      min-height: 320px;
      color: var(--metabolic-primary);
      font: 14px var(--metabolic-font-data);
      text-align: center;
    }

    .wireframe .material-symbols-outlined {
      font-size: 64px;
      opacity: 0.6;
    }

    .wireframe b {
      color: var(--metabolic-text);
      font-size: 12px;
    }
  `]
})
export class BiometricSyncComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly profile = inject(ProfileService);
  private readonly progress = inject(ProgressService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.group({
    height: [175, Validators.required],
    weight: [80, Validators.required],
  });

  submit(): void {
    this.loading.set(true);
    this.error.set('');

    const { height, weight } = this.form.getRawValue();
    const today = new Date().toISOString().split('T')[0];

    this.profile
      .update({ height_cm: height, current_weight_kg: weight })
      .pipe(
        switchMap(() =>
          this.progress.create({
            date: today,
            weight_kg: weight,
          })
        ),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (err: unknown) => {
          this.error.set(AuthService.extractErrorMessage(err));
        },
      });
  }
}
