import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'cyan' | 'rose' | 'green' | 'muted';

/**
 * Badge de estado reutilizable.
 * Mapea semánticamente a los estados del dominio:
 *   - Protocolos: ALPHA, STABLE, BETA
 *   - Prioridades: ALTO, MEDIO, BAJO
 *   - Misiones: PENDIENTE, COMPLETADA
 */
@Component({
  selector: 'status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class.badge--cyan]="tone() === 'cyan'" [class.badge--rose]="tone() === 'rose'" [class.badge--green]="tone() === 'green'" [class.badge--muted]="tone() === 'muted'">{{ label() }}</span>`,
  styles: [`
    :host { display: inline-block; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 9px;
      border: 1px solid;
      font: 700 10px/1 var(--metabolic-font-data);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .badge--cyan {
      color: var(--metabolic-primary);
      background: rgba(76, 215, 246, 0.1);
      border-color: var(--metabolic-primary);
    }

    .badge--rose {
      color: var(--metabolic-secondary);
      background: rgba(255, 178, 183, 0.1);
      border-color: var(--metabolic-secondary);
    }

    .badge--green {
      color: var(--metabolic-tertiary);
      background: rgba(78, 222, 163, 0.1);
      border-color: var(--metabolic-tertiary);
    }

    .badge--muted {
      color: var(--metabolic-text-muted);
      background: rgba(188, 201, 205, 0.08);
      border-color: var(--metabolic-outline-variant);
    }
  `]
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<BadgeTone>('cyan');
}
