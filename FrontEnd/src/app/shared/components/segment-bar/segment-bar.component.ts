import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SegmentTone = 'cyan' | 'rose' | 'green';

/**
 * Barra de progreso segmentada estilo HUD militar.
 * Cada segmento representa un paso discreto (p. ej. 10% por segmento).
 */
@Component({
  selector: 'segment-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="segment-bar"
      role="progressbar"
      [attr.aria-valuenow]="value()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label()">
      @for (segment of segments(); track $index) {
        <div
          class="segment"
          [class.segment--active]="segment.active"
          [class.segment--cyan]="segment.active && tone() === 'cyan'"
          [class.segment--rose]="segment.active && tone() === 'rose'"
          [class.segment--green]="segment.active && tone() === 'green'"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .segment-bar {
      display: flex;
      gap: 2px;
      width: 100%;
    }

    .segment {
      flex: 1 1 auto;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--metabolic-grid-line);
      transition: background-color 0.25s ease, box-shadow 0.25s ease;
    }

    .segment--cyan {
      background: var(--metabolic-primary);
      box-shadow: 0 0 8px var(--metabolic-primary);
    }

    .segment--rose {
      background: var(--metabolic-secondary);
      box-shadow: 0 0 8px var(--metabolic-secondary);
    }

    .segment--green {
      background: var(--metabolic-tertiary);
      box-shadow: 0 0 8px var(--metabolic-tertiary);
    }
  `]
})
export class SegmentBarComponent {
  readonly value = input.required<number>();
  readonly totalSegments = input<number>(10);
  readonly tone = input<SegmentTone>('cyan');
  readonly label = input('Progreso');

  protected segments(): { active: boolean }[] {
    const total = this.totalSegments();
    const value = Math.max(0, Math.min(100, this.value()));
    const activeCount = Math.round((value / 100) * total);
    return Array.from({ length: total }, (_, i) => ({ active: i < activeCount }));
  }
}
