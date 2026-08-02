import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MetabolicButtonComponent } from '../../shared/components/metabolic-button/metabolic-button.component';
import { MetabolicCardComponent } from '../../shared/components/metabolic-card/metabolic-card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SegmentBarComponent } from '../../shared/components/segment-bar/segment-bar.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ProgressService } from '../../shared/services/domain.services';
import { ProfileStore } from '../../shared/services/profile.store';
import { AuthService } from '../../shared/services/auth.service';
import {
  MuscleGroupVolumeSummary,
  ProgressEntryRead,
  ProgressSummary,
} from '../../shared/models/domain.models';
import { PaginationService } from '../../shared/services/pagination.service';

@Component({
  selector: 'metabolic-progress',
  standalone: true,
  imports: [
    DecimalPipe,
    MetabolicButtonComponent,
    MetabolicCardComponent,
    ProgressBarComponent,
    StatusBadgeComponent,
    SegmentBarComponent,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="heading">
        <div>
          <p class="eyebrow">SYSTEM_LOAD // TELEMETRY</p>
          <h1>EVOLUCION_DEL_OPERADOR</h1>
          <p>Lecturas agregadas de rendimiento metabólico.</p>
        </div>
        <div class="period">
          <button
            type="button"
            [class.active]="period() === 'MES'"
            (click)="period.set('MES')">
            MES
          </button>
          <button
            type="button"
            [class.active]="period() === 'SEMANA'"
            (click)="period.set('SEMANA')">
            SEMANA
          </button>
        </div>
      </header>

      @if (error()) {
        <p class="api-error" role="alert">{{ error() }}</p>
      }

      @if (loading()) {
        <metabolic-card accent="cyan">
          <metabolic-skeleton [rows]="4" />
        </metabolic-card>
      } @else {
        <div class="progress-grid">
          <metabolic-card accent="cyan">
            <p class="eyebrow">METABOLIC_OUTPUT // {{ period() }}</p>
            <div class="chart" aria-label="Gráfica de rendimiento" role="img">
              @for (point of weightPoints(); track $index) {
                <span [style.height.%]="point"></span>
              }
            </div>
            <div class="chart-labels">
              @for (label of chartLabels(); track $index) {
                <span>{{ label }}</span>
              }
            </div>
          </metabolic-card>

          <metabolic-card accent="rose">
            <p class="eyebrow">PERFORMANCE_INDEX</p>
            <div class="score">
              {{ performanceScore() }}<small>/100</small>
            </div>
            <progress-bar [value]="performanceScore()" />
            <p class="caption">
              {{ summary()?.total_sessions ?? 0 }} sesiones // XP {{ summary()?.xp_total ?? 0 }}
            </p>
          </metabolic-card>
        </div>

        <metabolic-card>
          <header class="log-heading">
            <p class="eyebrow">TELEMETRY_LOG</p>
            <status-badge label="LIVE_STREAM" tone="green" />
          </header>

          <div class="log">
            @for (entry of progressEntries(); track entry.id) {
              <div>
                <span>{{ entry.date }}</span>
                <b>WEIGHT_RECORD // {{ entry.operator_alias }}</b>
                <em>{{ entry.weight_kg }} KG</em>
              </div>
            } @empty {
              <p class="empty-text">NO HAY ENTRADAS DE PROGRESO.</p>
            }
          </div>

          @if (pagination().hasNext || pagination().hasPrevious) {
            <div class="pagination">
              <button
                metabolicButton
                variant="outline"
                type="button"
                [disabled]="!pagination().hasPrevious"
                (click)="loadEntries(pagination().page - 1)">
                ←
              </button>
              <span>{{ pagination().page }}</span>
              <button
                metabolicButton
                variant="outline"
                type="button"
                [disabled]="!pagination().hasNext"
                (click)="loadEntries(pagination().page + 1)">
                →
              </button>
            </div>
          }
        </metabolic-card>

        <div class="volume-grid">
          @for (volume of volumes(); track volume.muscle_group) {
            <metabolic-card>
              <span class="eyebrow">{{ volume.muscle_group }}</span>
              <div class="stat-value">
                <strong>{{ volume.total_volume | number }}</strong>
                <small>KG VOL</small>
              </div>
              <segment-bar [value]="volumePercentage(volume.total_volume)" tone="green" />
            </metabolic-card>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }

    .page { display: grid; gap: 22px; }

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

    .period {
      display: flex;
      gap: 8px;
      padding: 4px;
      border: 1px solid var(--metabolic-grid-line);
      background: var(--metabolic-surface-dark);
    }

    .period button {
      padding: 8px 16px;
      border: 0;
      background: transparent;
      color: var(--metabolic-text-muted);
      font: 11px var(--metabolic-font-data);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .period button.active,
    .period button:hover {
      background: var(--metabolic-primary);
      color: var(--metabolic-background);
    }

    .api-error {
      margin: 0;
      padding: 12px;
      border-left: 3px solid var(--metabolic-secondary);
      background: rgba(181, 0, 54, 0.12);
      color: var(--metabolic-secondary);
      font: 12px var(--metabolic-font-data);
    }

    .progress-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 18px;
    }

    @media (max-width: 900px) {
      .progress-grid { grid-template-columns: 1fr; }
    }

    .chart {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 200px;
      padding: 20px 0 0;
      border-left: 1px solid var(--metabolic-grid-line);
      border-bottom: 1px solid var(--metabolic-grid-line);
    }

    .chart span {
      flex: 1;
      background: var(--metabolic-primary);
      box-shadow: 0 0 8px var(--metabolic-primary);
      min-height: 4px;
      transition: height 0.4s ease;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      color: var(--metabolic-text-muted);
      font: 10px var(--metabolic-font-data);
    }

    .score {
      color: var(--metabolic-text);
      font: 700 4rem var(--metabolic-font-data);
      margin: 16px 0;
    }

    .score small {
      font-size: 1.5rem;
      color: var(--metabolic-text-muted);
    }

    .caption {
      color: var(--metabolic-text-muted);
      font: 12px var(--metabolic-font-data);
      margin: 12px 0 0;
    }

    .log-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--metabolic-grid-line);
    }

    .log {
      display: grid;
      gap: 8px;
    }

    .log > div {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 16px;
      padding: 12px;
      border: 1px solid var(--metabolic-grid-line);
      background: var(--metabolic-surface-dark);
      align-items: center;
    }

    @media (max-width: 700px) {
      .log > div { grid-template-columns: 1fr; }
    }

    .log span {
      color: var(--metabolic-primary);
      font: 11px var(--metabolic-font-data);
    }

    .log b {
      color: var(--metabolic-text);
      font: 13px var(--metabolic-font-data);
      text-transform: uppercase;
    }

    .log em {
      color: var(--metabolic-text-muted);
      font: 12px var(--metabolic-font-data);
      font-style: normal;
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

    .volume-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
    }

    .stat-value {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 12px 0;
    }

    .stat-value strong {
      color: var(--metabolic-text);
      font: 700 1.8rem var(--metabolic-font-data);
    }

    .stat-value small {
      color: var(--metabolic-text-dim);
      font: 12px var(--metabolic-font-data);
    }
  `]
})
export class ProgressComponent implements OnInit {
  private readonly progressService = inject(ProgressService);
  private readonly paginationService = inject(PaginationService);
  readonly profileStore = inject(ProfileStore);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly period = signal<'MES' | 'SEMANA'>('MES');
  readonly summary = signal<ProgressSummary | null>(null);
  readonly progressEntries = signal<ProgressEntryRead[]>([]);
  readonly volumes = signal<MuscleGroupVolumeSummary[]>([]);

  constructor() {
    effect(() => {
      this.period(); // track period changes
      this.loadVolumes();
    });
  }

  readonly pagination = signal({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  readonly performanceScore = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    const score = Math.min(100, Math.round((s.xp_total / 1000) * 100 + s.total_sessions * 2));
    return score;
  });

  readonly weightPoints = computed(() => {
    const entries = this.progressEntries().slice(0, 7);
    if (entries.length === 0) return [10, 20, 30, 40, 50, 60, 70];
    const max = Math.max(...entries.map(e => e.weight_kg));
    return entries.map(e => Math.max(5, (e.weight_kg / max) * 90));
  });

  readonly chartLabels = computed(() => {
    const entries = this.progressEntries().slice(0, 7);
    if (entries.length === 0) return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return entries.map(e => e.date.slice(5));
  });

  ngOnInit(): void {
    this.loadSummary();
    this.loadEntries();
    this.loadVolumes();
  }

  loadSummary(): void {
    this.loading.set(true);
    this.progressService.summary().subscribe({
      next: s => {
        this.summary.set(s);
      },
      error: (err: unknown) => {
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  loadEntries(page = 1): void {
    this.progressService.list(page).subscribe({
      next: response => {
        this.progressEntries.set(response.results);
        this.pagination.set({
          page,
          totalPages: this.paginationService.totalPages(response),
          hasNext: this.paginationService.hasNext(response),
          hasPrevious: this.paginationService.hasPrevious(response),
        });
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  loadVolumes(): void {
    const range = this.dateRangeForPeriod(this.period());
    this.progressService.volumeByGroup(range.dateFrom, range.dateTo).subscribe({
      next: v => this.volumes.set(v),
      error: () => {},
    });
  }

  private dateRangeForPeriod(period: 'MES' | 'SEMANA'): { dateFrom: string; dateTo: string } {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const from = new Date(now);
    if (period === 'SEMANA') {
      from.setDate(now.getDate() - 6);
    } else {
      from.setDate(1);
    }
    return { dateFrom: from.toISOString().slice(0, 10), dateTo: to };
  }

  volumePercentage(value: number): number {
    const max = Math.max(...this.volumes().map(v => v.total_volume), 1);
    return Math.round((value / max) * 100);
  }
}
