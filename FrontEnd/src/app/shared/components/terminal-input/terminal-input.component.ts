import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TerminalInputType = 'text' | 'password' | 'email' | 'number';

/**
 * Input estilo terminal para formularios.
 * Soporta icono derecho (nombre de icono Material Symbols) y variantes de borde.
 */
@Component({
  selector: 'terminal-input',
  standalone: true,
  imports: [FormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TerminalInputComponent, multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="field">
      <span class="field__label">{{ label() }}</span>
      <div class="field__wrapper">
        <input
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled"
          [ngModel]="value"
          (ngModelChange)="change($event)"
          (blur)="touched()" />
        @if (icon()) {
          <span class="material-symbols-outlined field__icon" aria-hidden="true">{{ icon() }}</span>
        }
      </div>
    </label>
  `,
  styles: [`
    :host { display: block; }

    .field {
      display: grid;
      gap: 8px;
      color: var(--metabolic-primary);
      font: 700 11px/1.2 var(--metabolic-font-data);
      letter-spacing: 0.11em;
    }

    .field__label {
      text-transform: uppercase;
    }

    .field__wrapper {
      position: relative;
    }

    input {
      width: 100%;
      min-height: 46px;
      padding: 12px 14px;
      border: 1px solid var(--metabolic-grid-line);
      border-bottom: 2px solid var(--metabolic-outline-variant);
      border-radius: 0;
      background: var(--metabolic-surface-dark);
      color: var(--metabolic-text-soft);
      font: 400 14px/1.4 var(--metabolic-font-data);
      letter-spacing: normal;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    input::placeholder {
      color: var(--metabolic-text-dim);
    }

    input:focus {
      border-color: var(--metabolic-primary);
      box-shadow: inset 0 0 8px rgba(6, 182, 212, 0.3);
      outline: 0;
      color: #ffffff;
      text-shadow: 0 0 6px rgba(76, 215, 246, 0.4);
    }

    input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .field__icon {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--metabolic-text-dim);
      pointer-events: none;
    }
  `]
})
export class TerminalInputComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly type = input<TerminalInputType>('text');
  readonly icon = input<string | null>(null);

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  change(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  touched(): void {
    this.onTouched();
  }
}
