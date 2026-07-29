import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MetabolicButtonComponent } from '../../shared/components/metabolic-button/metabolic-button.component';
import { MetabolicCardComponent } from '../../shared/components/metabolic-card/metabolic-card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { MissionsService } from '../../shared/services/domain.services';
import { ProfileStore } from '../../shared/services/profile.store';
import { AuthService } from '../../shared/services/auth.service';
import { MissionRead, MissionWrite } from '../../shared/models/domain.models';
import {
  MISSION_PRIORITIES,
  MISSION_STATUSES,
  MISSION_TYPES,
} from '../../shared/constants/domain.constants';
import { PaginationService } from '../../shared/services/pagination.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'metabolic-missions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MetabolicButtonComponent,
    MetabolicCardComponent,
    ProgressBarComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="heading">
        <div>
          <p class="eyebrow">MISSION_CONTROL_v4.2</p>
          <h1>MISIONES_ACTIVAS</h1>
          <p>Objetivos tácticos asignados al operador.</p>
        </div>
        <button metabolicButton type="button" (click)="toggleCreator()">
          {{ creator() ? 'CANCELAR' : '+ NEW_MISSION' }}
        </button>
      </header>

      @if (error()) {
        <p class="api-error" role="alert">{{ error() }}</p>
      }

      @if (creator()) {
        <metabolic-card accent="rose">
          <form [formGroup]="missionForm" (ngSubmit)="saveMission()" class="creator">
            <p class="eyebrow">NEW_MISSION.sh</p>

            <label>
              <span>Identificador de Misión</span>
              <input formControlName="title" placeholder="EJ: PROTOCOLO_Z" />
            </label>

            <label>
              <span>Descripción Táctica</span>
              <textarea formControlName="description" rows="3" placeholder="DESCRIBIR OBJETIVOS TÁCTICOS..."></textarea>
            </label>

            <div class="form-row">
              <label>
                <span>Prioridad</span>
                <select formControlName="priority">
                  @for (p of priorities; track p) {
                    <option [value]="p">{{ p }}</option>
                  }
                </select>
              </label>

              <label>
                <span>Tipo</span>
                <select formControlName="mission_type">
                  @for (t of missionTypes; track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </label>

              <label>
                <span>XP Reward</span>
                <input type="number" formControlName="xp_reward" />
              </label>

              <label>
                <span>Meta</span>
                <input type="number" formControlName="goal" />
              </label>
            </div>

            <button metabolicButton type="submit" [disabled]="saving()" [loading]="saving()">
              {{ saving() ? 'INICIALIZANDO...' : 'INICIALIZAR MISION' }}
            </button>
          </form>
        </metabolic-card>
      }

      <div class="mission-grid">
        <metabolic-card>
          <p class="eyebrow">ACTIVE_OPERATIONS</p>

          @if (loading()) {
            <metabolic-skeleton [rows]="3" />
          } @else {
            <div class="missions">
              @for (mission of activeMissions(); track mission.id) {
                <article [class.completed]="mission.status === 'COMPLETADA'">
                  <div class="mission-title">
                    <status-badge
                      [label]="mission.priority"
                      [tone]="badgeTone(mission.priority)" />
                    <h2>{{ mission.title }}</h2>
                  </div>
                  <p>{{ mission.description }}</p>
                  <div class="mission-meta">
                    <span>PROGRESO: {{ mission.progress_percent }}%</span>
                    <span>XP: +{{ mission.xp_reward }}</span>
                  </div>
                  <progress-bar [value]="mission.progress_percent" [tone]="badgeTone(mission.priority)" />

                  @if (mission.status !== 'COMPLETADA') {
                    <button
                      metabolicButton
                      variant="outline"
                      type="button"
                      class="complete-btn"
                      [disabled]="completing() === mission.id"
                      (click)="completeMission(mission.id)">
                      {{ completing() === mission.id ? 'PROCESANDO...' : 'MARCAR COMPLETA' }}
                    </button>
                  }
                </article>
              } @empty {
                <p class="empty-text">NO HAY MISIONES ACTIVAS.</p>
              }
            </div>
          }
        </metabolic-card>

        <metabolic-card accent="rose">
          <p class="eyebrow">HISTORICAL_ARCHIVE</p>
          <div class="archive">
            @for (mission of completedMissions(); track mission.id) {
              <div>
                <span>{{ mission.title }}</span>
                <status-badge label="COMPLETADA" tone="green" />
              </div>
            } @empty {
              <p class="empty-text">ARCHIVO VACÍO.</p>
            }
          </div>

          @if (archivePagination().hasNext || archivePagination().hasPrevious) {
            <div class="pagination">
              <button
                metabolicButton
                variant="ghost"
                type="button"
                [disabled]="!archivePagination().hasPrevious"
                (click)="loadArchive(archivePagination().page - 1)">
                ←
              </button>
              <span>{{ archivePagination().page }}</span>
              <button
                metabolicButton
                variant="ghost"
                type="button"
                [disabled]="!archivePagination().hasNext"
                (click)="loadArchive(archivePagination().page + 1)">
                →
              </button>
            </div>
          }
        </metabolic-card>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .page { display: grid; gap: 24px; }

    .heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .eyebrow {
      margin: 0;
      color: var(--metabolic-primary);
      font: 700 10px var(--metabolic-font-data);
      letter-spacing: 0.15em;
    }

    .heading h1 {
      margin: 10px 0;
      color: var(--metabolic-text);
      font: 600 clamp(1.6rem, 4vw, 2.4rem) var(--metabolic-font-display);
    }

    .heading p:not(.eyebrow) {
      margin: 0;
      color: var(--metabolic-text-muted);
      font: 14px/1.6 var(--metabolic-font-data);
    }

    .api-error {
      margin: 0;
      padding: 12px;
      border-left: 3px solid var(--metabolic-secondary);
      background: rgba(181, 0, 54, 0.12);
      color: var(--metabolic-secondary);
      font: 12px var(--metabolic-font-data);
    }

    .creator {
      display: grid;
      gap: 16px;
    }

    .creator label {
      display: grid;
      gap: 6px;
      color: var(--metabolic-primary);
      font: 700 10px var(--metabolic-font-data);
      letter-spacing: 0.1em;
    }

    .creator input,
    .creator select,
    .creator textarea {
      padding: 12px;
      background: var(--metabolic-surface-dark);
      border: 1px solid var(--metabolic-grid-line);
      border-bottom: 2px solid var(--metabolic-outline-variant);
      color: var(--metabolic-text);
      font: 14px var(--metabolic-font-data);
    }

    .creator input:focus,
    .creator select:focus,
    .creator textarea:focus {
      border-color: var(--metabolic-primary);
      outline: none;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .mission-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 18px;
    }

    @media (max-width: 900px) {
      .mission-grid { grid-template-columns: 1fr; }
    }

    .missions {
      display: grid;
      gap: 16px;
    }

    article {
      padding: 16px;
      border: 1px solid var(--metabolic-grid-line);
      background: var(--metabolic-surface-dark);
      transition: opacity 0.2s ease;
    }

    article.completed {
      opacity: 0.5;
    }

    .mission-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    article h2 {
      margin: 0;
      color: var(--metabolic-text);
      font: 600 1.1rem var(--metabolic-font-heading);
      text-transform: uppercase;
    }

    article > p {
      color: var(--metabolic-text-muted);
      font: 13px/1.5 var(--metabolic-font-data);
      margin: 0 0 12px;
    }

    .mission-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
      color: var(--metabolic-text-dim);
      font: 11px var(--metabolic-font-data);
    }

    .complete-btn {
      margin-top: 12px;
      width: 100%;
    }

    .archive {
      display: grid;
      gap: 8px;
    }

    .archive > div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid var(--metabolic-grid-line);
      background: var(--metabolic-surface-dark);
    }

    .archive span {
      color: var(--metabolic-text);
      font: 13px var(--metabolic-font-data);
    }

    .empty-text {
      color: var(--metabolic-text-muted);
      font: 12px var(--metabolic-font-data);
      text-align: center;
      padding: 24px 0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    .pagination span {
      color: var(--metabolic-text-muted);
      font: 12px var(--metabolic-font-data);
    }
  `]
})
export class MissionsComponent implements OnInit {
  private readonly missionsService = inject(MissionsService);
  private readonly paginationService = inject(PaginationService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(ToastService);
  readonly profileStore = inject(ProfileStore);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly completing = signal<string | null>(null);
  readonly error = signal('');
  readonly creator = signal(false);
  readonly activeMissions = signal<MissionRead[]>([]);
  readonly completedMissions = signal<MissionRead[]>([]);

  readonly archivePagination = signal({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  readonly priorities = MISSION_PRIORITIES;
  readonly missionTypes = MISSION_TYPES;
  readonly statuses = MISSION_STATUSES;

  readonly missionForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIO' as const, Validators.required],
    mission_type: ['EJERCICIO' as const, Validators.required],
    xp_reward: [10, [Validators.required, Validators.min(1)]],
    goal: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadActive();
    this.loadArchive();
  }

  loadActive(): void {
    this.loading.set(true);
    this.missionsService.list(1).subscribe({
      next: response => {
        const active = response.results.filter(m => m.status !== 'COMPLETADA');
        this.activeMissions.set(active);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  loadArchive(page = 1): void {
    this.missionsService.list(page, 'COMPLETADA').subscribe({
      next: response => {
        this.completedMissions.set(response.results);
        this.archivePagination.set({
          page,
          totalPages: this.paginationService.totalPages(response),
          hasNext: this.paginationService.hasNext(response),
          hasPrevious: this.paginationService.hasPrevious(response),
        });
      },
      error: (err: unknown) => {
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  toggleCreator(): void {
    this.creator.update(v => !v);
    if (!this.creator()) {
      this.missionForm.reset();
    }
  }

  saveMission(): void {
    if (this.missionForm.invalid) {
      this.missionForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const payload = this.missionForm.getRawValue() as MissionWrite;

    this.missionsService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.creator.set(false);
        this.missionForm.reset();
        this.loadActive();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  completeMission(id: string): void {
    this.completing.set(id);
    this.missionsService.complete(id).subscribe({
      next: () => {
        this.completing.set(null);
        this.toast.success('Misión completada. XP sincronizado con el perfil operativo.');
        this.loadActive();
        this.loadArchive(this.archivePagination().page);
      },
      error: (err: unknown) => {
        this.completing.set(null);
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  badgeTone(priority: string): 'rose' | 'cyan' | 'green' {
    if (priority === 'ALTO') return 'rose';
    if (priority === 'BAJO') return 'green';
    return 'cyan';
  }
}
