import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Skeleton loader estilo scan/grid.
 * Uso: <metabolic-skeleton [rows]="4" />
 */
@Component({
  selector: 'metabolic-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton" [style.--rows]="rows()" aria-hidden="true">
      @for (row of rowsArray(); track $index) {
        <div class="skeleton__row"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .skeleton {
      display: grid;
      gap: 12px;
    }

    .skeleton__row {
      height: 16px;
      background: linear-gradient(
        90deg,
        var(--metabolic-surface-high) 0%,
        var(--metabolic-surface-container) 50%,
        var(--metabolic-surface-high) 100%
      );
      background-size: 200% 100%;
      animation: skeleton-scan 1.5s infinite linear;
      border: 1px solid var(--metabolic-grid-line);
    }

    @keyframes skeleton-scan {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonLoaderComponent {
  readonly rows = input<number>(3);

  protected rowsArray(): number[] {
    return Array.from({ length: this.rows() }, (_, i) => i);
  }
}
