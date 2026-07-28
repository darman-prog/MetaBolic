import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ProgressTone = 'cyan' | 'rose' | 'green';

/**
 * Barra de progreso continua con glow.
 * Para barras segmentadas (estilo HUD) usar <segment-bar>.
 */
@Component({
  selector: 'progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="progress"
      role="progressbar"
      [attr.aria-valuenow]="value()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label()">
      <span
        class="progress__fill"
        [class.progress__fill--cyan]="tone() === 'cyan'"
        [class.progress__fill--rose]="tone() === 'rose'"
        [class.progress__fill--green]="tone() === 'green'"
        [style.width.%]="value()"></span>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .progress {
      height: 8px;
      background: var(--metabolic-surface-high);
      border: 1px solid var(--metabolic-grid-line);
      overflow: hidden;
    }

    .progress__fill {
      display: block;
      height: 100%;
      transition: width 0.35s ease;
    }

    .progress__fill--cyan {
      background: var(--metabolic-primary);
      box-shadow: 0 0 8px var(--metabolic-primary);
    }

    .progress__fill--rose {
      background: var(--metabolic-secondary);
      box-shadow: 0 0 8px var(--metabolic-secondary);
    }

    .progress__fill--green {
      background: var(--metabolic-tertiary);
      box-shadow: 0 0 8px var(--metabolic-tertiary);
    }
  `]
})
export class ProgressBarComponent {
  readonly value = input.required<number>();
  readonly tone = input<ProgressTone>('cyan');
  readonly label = input('Progreso');
}
