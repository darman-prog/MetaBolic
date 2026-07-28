import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';

/**
 * Botón táctico reutilizable.
 * Uso: <button metabolicButton variant="primary" [loading]="true">Texto</button>
 */
@Component({
  selector: 'button[metabolicButton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': '"button button--" + variant()',
    '[class.button--loading]': 'loading()',
    '[attr.aria-busy]': 'loading()',
    '[attr.disabled]': 'loading() || disabled() ? true : null'
  },
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 44px;
      padding: 14px 20px;
      border: 1px solid transparent;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font: 700 12px/1 var(--metabolic-font-data);
      transition: filter 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
      clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0% 30%);
    }

    :host(.button--primary) {
      color: var(--metabolic-background);
      background: var(--metabolic-primary);
      border-color: var(--metabolic-primary);
    }

    :host(.button--outline) {
      color: var(--metabolic-primary);
      background: transparent;
      border-color: var(--metabolic-primary);
    }

    :host(.button--danger) {
      color: var(--metabolic-secondary);
      background: transparent;
      border-color: var(--metabolic-secondary);
    }

    :host(.button--ghost) {
      color: var(--metabolic-text-muted);
      background: transparent;
      border-color: transparent;
    }

    :host(:hover:not(:disabled)) {
      filter: brightness(1.14);
      box-shadow: 0 0 15px var(--metabolic-glow-cyan-soft);
    }

    :host(.button--danger:hover:not(:disabled)) {
      box-shadow: 0 0 15px var(--metabolic-glow-rose);
    }

    :host(:active:not(:disabled)) {
      transform: scale(0.98);
    }

    :host(:disabled),
    :host(.button--loading) {
      opacity: 0.55;
      cursor: not-allowed;
      filter: none;
      box-shadow: none;
    }
  `]
})
export class MetabolicButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly loading = input(false);
  readonly disabled = input(false);
}
