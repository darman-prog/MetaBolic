import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardAccent = 'cyan' | 'rose' | 'green' | 'neutral';

/**
 * Card base reutilizable con variantes de borde/accento.
 * Soporta proyección de contenido en header/main/footer.
 */
@Component({
  selector: 'metabolic-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card" [class.card--cyan]="accent() === 'cyan'" [class.card--rose]="accent() === 'rose'" [class.card--green]="accent() === 'green'">
      @if (hasHeader()) {
        <header class="card__header">
          <ng-content select="[cardHeader]"></ng-content>
        </header>
      }
      <div class="card__body">
        <ng-content></ng-content>
      </div>
      @if (hasFooter()) {
        <footer class="card__footer">
          <ng-content select="[cardFooter]"></ng-content>
        </footer>
      }
    </article>
  `,
  styles: [`
    :host { display: block; }

    .card {
      position: relative;
      background: color-mix(in srgb, var(--metabolic-surface-low) 84%, transparent);
      border: 1px solid var(--metabolic-grid-line);
      padding: 24px;
      backdrop-filter: blur(12px);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .card--cyan { border-top: 3px solid var(--metabolic-primary); }
    .card--rose { border-top: 3px solid var(--metabolic-secondary); }
    .card--green { border-top: 3px solid var(--metabolic-tertiary); }

    .card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--metabolic-grid-line);
    }

    .card__body:empty + .card__footer,
    .card__header:empty {
      display: none;
    }

    .card__footer {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--metabolic-grid-line);
    }
  `]
})
export class MetabolicCardComponent {
  readonly accent = input<CardAccent>('neutral');

  // En un componente real usaríamos ContentChild para saber si hay slots,
  // pero con ng-content select no tenemos esa API directa. Como workaround,
  // ofrecemos inputs opcionales para mostrar header/footer.
  readonly hasHeader = input(false);
  readonly hasFooter = input(false);
}
