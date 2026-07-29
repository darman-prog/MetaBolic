import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastType } from './toast.service';

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

@Component({
  selector: 'metabolic-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" role="region" aria-live="polite" aria-label="Notificaciones">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast--success]="toast.type === 'success'"
          [class.toast--error]="toast.type === 'error'"
          [class.toast--warning]="toast.type === 'warning'"
          [class.toast--info]="toast.type === 'info'">
          <span class="material-symbols-outlined toast__icon" aria-hidden="true">{{ iconFor(toast.type) }}</span>
          <span class="toast__message">{{ toast.message }}</span>
          <button
            class="toast__close"
            type="button"
            aria-label="Cerrar notificación"
            (click)="toastService.dismiss(toast.id)">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: grid;
      gap: 12px;
      width: min(360px, calc(100vw - 40px));
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-left: 4px solid;
      background: var(--metabolic-surface-container);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: toast-in 0.25s ease;
      backdrop-filter: blur(12px);
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }

    .toast--success {
      border-left-color: var(--metabolic-tertiary);
      color: var(--metabolic-tertiary);
    }

    .toast--error {
      border-left-color: var(--metabolic-secondary);
      color: var(--metabolic-secondary);
    }

    .toast--warning {
      border-left-color: #f59e0b;
      color: #f59e0b;
    }

    .toast--info {
      border-left-color: var(--metabolic-primary);
      color: var(--metabolic-primary);
    }

    .toast__icon {
      font-size: 22px;
      flex-shrink: 0;
    }

    .toast__message {
      flex: 1;
      color: var(--metabolic-text-soft);
      font: 13px/1.5 var(--metabolic-font-data);
    }

    .toast__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 0;
      background: transparent;
      color: var(--metabolic-text-muted);
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .toast__close:hover {
      color: var(--metabolic-text);
    }

    @media (max-width: 600px) {
      .toast-container {
        top: auto;
        bottom: 20px;
        right: 50%;
        transform: translateX(50%);
      }
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  iconFor(type: ToastType): string {
    return ICONS[type];
  }
}
