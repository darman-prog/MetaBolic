import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MetabolicButtonComponent } from '../../shared/components/metabolic-button/metabolic-button.component';
import { MetabolicCardComponent } from '../../shared/components/metabolic-card/metabolic-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SegmentBarComponent } from '../../shared/components/segment-bar/segment-bar.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import {
  MissionsService,
  ProgressService,
  SessionsService,
} from '../../shared/services/domain.services';
import { ProfileStore } from '../../shared/services/profile.store';
import { ProgressSummary, TrainingSessionRead, MissionRead } from '../../shared/models/domain.models';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'metabolic-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    MetabolicButtonComponent,
    MetabolicCardComponent,
    StatusBadgeComponent,
    ProgressBarComponent,
    SegmentBarComponent,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dashboard">
      <header class="page-heading">
        <div>
          <p class="eyebrow">{{ today() }}</p>
          <h1>COMMAND_CENTER</h1>
          <p class="subhead">Telemetría operativa y estado metabólico del operador.</p>
        </div>
        <status-badge label="SYSTEM_ONLINE" tone="green" />
      </header>

      @if (error()) {
        <p class="api-error" role="alert">
          <span class="error-prefix">[ERROR_FF]</span> {{ error() }}
        </p>
      }

      @if (loading()) {
        <metabolic-card accent="cyan">
          <metabolic-skeleton [rows]="4" />
        </metabolic-card>
      } @else if (!hasTelemetry()) {
        <metabolic-card accent="cyan">
          <div class="empty">
            <span class="material-symbols-outlined empty__icon" aria-hidden="true">monitoring</span>
            <p class="eyebrow">SYSTEM_IDLE: NO ACTIVE TELEMETRY</p>
            <h2>AWAITING_BIOMETRIC_SYNC</h2>
            <p>Aguardando sincronización de datos biométricos. Registre su primera sesión para inicializar los protocolos de optimización metabólica.</p>
            <button metabolicButton type="button" routerLink="/biometric-sync">+ LOG_EXERCISE</button>
          </div>
        </metabolic-card>
      } @else {
        <div class="stats">
          <metabolic-card>
            <span class="eyebrow">CURRENT_STREAK</span>
            <div class="stat-value">
              <strong>{{ summary()?.current_streak_days ?? 0 }}</strong>
              <small>DAYS</small>
            </div>
            <segment-bar [value]="(summary()?.current_streak_days ?? 0) * 5" tone="cyan" />
          </metabolic-card>

          <metabolic-card accent="green">
            <span class="eyebrow">TOTAL_CALORIES</span>
            <div class="stat-value">
              <strong>{{ summary()?.total_calories ?? 0 | number }}</strong>
              <small>KCAL</small>
            </div>
            <segment-bar [value]="40" tone="green" />
          </metabolic-card>

          <metabolic-card accent="rose">
            <span class="eyebrow">NEXT_MISSION</span>
            @if (nextMission(); as mission) {
              <div class="stat-value">
                <strong>{{ mission.title }}</strong>
              </div>
              <p class="mission-deadline">{{ mission.deadline ?? 'SIN_FECHA_LIMITE' }}</p>
              <segment-bar [value]="mission.progress_percent" tone="rose" />
            } @else {
              <div class="stat-value">
                <strong>--</strong>
              </div>
              <p class="mission-deadline">AWAITING_TELEMETRY</p>
              <segment-bar [value]="0" tone="rose" />
            }
          </metabolic-card>
        </div>
      }

      <div class="dashboard-grid">
        <metabolic-card>
          <header class="card-heading">
            <span class="eyebrow">SESSION_LOGS</span>
            <status-badge label="LIVE_STREAM" tone="green" />
          </header>

          @if (sessions().length === 0 && !loading()) {
            <p class="empty-text">NO HAY REGISTROS DE SESIÓN.</p>
          }

          @for (session of sessions(); track session.id) {
            <article class="session">
              <div>
                <strong>ID: {{ session.id }} // PROTOCOL: {{ session.protocol_name ?? 'LIBRE' }}</strong>
                <p>{{ session.date }}</p>
                <small>{{ session.actual_duration_min }} MIN // {{ session.total_load_kg }} KG // {{ session.estimated_calories ?? 0 }} KCAL</small>
              </div>
              <div class="intensity">
                <span>OUTPUT INTENSITY</span>
                <b>{{ session.estimated_calories ?? 0 }} KCAL</b>
                <progress-bar [value]="intensityFor(session)" />
              </div>
            </article>
          }
        </metabolic-card>

        <metabolic-card accent="rose">
          <span class="eyebrow">NEURAL_STATUS</span>
          <div class="neural">
            <b>12%</b>
            <span>LOAD</span>
          </div>
          <p class="subhead">UPLINK: ACTIVE // LATENCY: 4MS</p>
        </metabolic-card>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .dashboard {
      display: grid;
      gap: 28px;
    }

    .page-heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }

    .page-heading h1 {
      margin: 8px 0;
      color: var(--metabolic-text);
      font: 600 clamp(1.7rem, 4vw, 2.4rem) var(--metabolic-font-display);
      letter-spacing: 0.04em;
    }

    .eyebrow {
      margin: 0;
      color: var(--metabolic-primary);
      font: 700 10px var(--metabolic-font-data);
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .subhead {
      color: var(--metabolic-text-muted);
      font: 14px/1.6 var(--metabolic-font-data);
    }

    .empty {
      text-align: center;
      padding: 32px 16px;
    }

    .error-prefix {
      color: #ff0055;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .api-error {
      margin: 0;
      padding: 12px;
      border-left: 3px solid #ff0055;
      background: rgba(255, 0, 85, 0.1);
      color: var(--metabolic-secondary);
      font: 12px var(--metabolic-font-data);
      letter-spacing: 0.06em;
    }

    .empty__icon {
      font-size: 64px;
      color: var(--metabolic-primary);
      margin-bottom: 16px;
    }

    .empty h2 {
      margin: 12px 0;
      color: var(--metabolic-text);
      font: 600 1.4rem var(--metabolic-font-display);
    }

    .empty p:not(.eyebrow) {
      color: var(--metabolic-text-muted);
      font: 14px/1.6 var(--metabolic-font-data);
      margin-bottom: 24px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    @media (max-width: 900px) {
      .stats { grid-template-columns: 1fr; }
    }

    .stat-value {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 12px 0;
    }

    .stat-value strong {
      color: var(--metabolic-text);
      font: 700 2rem var(--metabolic-font-data);
    }

    .stat-value small {
      color: var(--metabolic-text-dim);
      font: 12px var(--metabolic-font-data);
    }

    .mission-deadline {
      color: var(--metabolic-text-muted);
      font: 11px var(--metabolic-font-data);
      margin: 0 0 12px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 18px;
    }

    @media (max-width: 900px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }

    .card-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--metabolic-grid-line);
    }

    .session {
      display: grid;
      grid-template-columns: 1fr 200px;
      gap: 24px;
      padding: 16px 0;
      border-bottom: 1px solid var(--metabolic-grid-line);
    }

    @media (max-width: 700px) {
      .session { grid-template-columns: 1fr; }
    }

    .session:last-child {
      border-bottom: 0;
    }

    .session strong {
      display: block;
      color: var(--metabolic-text);
      font: 12px var(--metabolic-font-data);
      margin-bottom: 4px;
    }

    .session p {
      margin: 0;
      color: var(--metabolic-text);
      font: 15px var(--metabolic-font-heading);
    }

    .session small {
      color: var(--metabolic-text-muted);
      font: 11px var(--metabolic-font-data);
    }

    .intensity span {
      display: block;
      color: var(--metabolic-primary);
      font: 10px var(--metabolic-font-data);
      letter-spacing: 0.1em;
      margin-bottom: 4px;
    }

    .intensity b {
      color: var(--metabolic-text);
      font: 14px var(--metabolic-font-data);
    }

    .neural {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin: 16px 0;
    }

    .neural b {
      color: var(--metabolic-primary);
      font: 700 3rem var(--metabolic-font-data);
      text-shadow: 0 0 10px var(--metabolic-glow-cyan-soft);
    }

    .neural span {
      color: var(--metabolic-text-muted);
      font: 12px var(--metabolic-font-data);
    }

    .empty-text {
      color: var(--metabolic-text-muted);
      font: 12px var(--metabolic-font-data);
      text-align: center;
      padding: 24px 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly progressService = inject(ProgressService);
  private readonly sessionsService = inject(SessionsService);
  private readonly missionsService = inject(MissionsService);
  private readonly profileStore = inject(ProfileStore);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly summary = signal<ProgressSummary | null>(null);
  readonly sessions = signal<TrainingSessionRead[]>([]);
  readonly missions = signal<MissionRead[]>([]);

  readonly hasTelemetry = computed(() => this.summary() !== null);
  readonly nextMission = computed(() => this.missions()[0] ?? null);
  readonly today = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    this.progressService.summary()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: summary => {
          this.summary.set(summary);
          this.loadSessions();
          this.loadMissions();
        },
        error: (err: unknown) => {
          this.error.set(AuthService.extractErrorMessage(err));
        },
      });
  }

  private loadSessions(): void {
    this.sessionsService.list(1).subscribe({
      next: response => {
        this.sessions.set(response.results.slice(0, 5));
      },
      error: () => {},
    });
  }

  private loadMissions(): void {
    this.missionsService.list(1).subscribe({
      next: response => {
        const active = response.results.filter(
          m => m.status === 'PENDIENTE' || m.status === 'EN_PROGRESO'
        );
        this.missions.set(active.slice(0, 3));
      },
      error: () => {},
    });
  }

  intensityFor(session: TrainingSessionRead): number {
    const calories = session.estimated_calories ?? 0;
    return Math.min(100, Math.round((calories / 800) * 100));
  }
}
