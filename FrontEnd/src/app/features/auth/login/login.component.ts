import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataRainComponent } from '../../../shared/components/data-rain/data-rain.component';
import { MetabolicButtonComponent } from '../../../shared/components/metabolic-button/metabolic-button.component';
import { MetabolicCardComponent } from '../../../shared/components/metabolic-card/metabolic-card.component';
import { ScanlineComponent } from '../../../shared/components/scanline/scanline.component';
import { TerminalInputComponent } from '../../../shared/components/terminal-input/terminal-input.component';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'metabolic-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DataRainComponent,
    MetabolicButtonComponent,
    MetabolicCardComponent,
    ScanlineComponent,
    TerminalInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <metabolic-data-rain [density]="100" color="#4cd7f6" />
    <main class="auth-page">
      <metabolic-scanline />
      <section class="auth-panel fade-enter">
        <header class="auth-brand">
          <div class="brand-mark">METABOLIC</div>
          <h1 class="sr-only">Neural Link Initialization - Authentication</h1>
        </header>

        <metabolic-card accent="cyan">
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <terminal-input
              label="OPERATOR_ID"
              placeholder="X-7749-ALPHA"
              icon="fingerprint"
              formControlName="username" />
            <p class="field-error" [class.visible]="showError('username')">
              <span class="error-prefix">[ERROR_01]</span> CAMPO_REQUERIDO
            </p>

            <terminal-input
              label="ACCESS_PHRASE"
              type="password"
              placeholder="••••••••"
              icon="lock_open"
              formControlName="password" />
            <p class="field-error" [class.visible]="showError('password')">
              <span class="error-prefix">[ERROR_02]</span> CAMPO_REQUERIDO
            </p>

            @if (error()) {
              <p class="api-error" role="alert">
                <span class="error-prefix">[ERROR_FF]</span> {{ error() }}
              </p>
            }

            @if (expired()) {
              <p class="api-error api-error--warning" role="alert">
                <span class="error-prefix">[WARN_01]</span> SESION_EXPIRADA // RE-IDENTIFIQUE AL OPERADOR.
              </p>
            }

            <button
              metabolicButton
              type="submit"
              [disabled]="loading()"
              [loading]="loading()">
              {{ loading() ? 'VALIDATING...' : 'INITIALIZE_SEQUENCE' }}
              <span class="material-symbols-outlined" aria-hidden="true">terminal</span>
            </button>
          </form>

          <div class="divider"><span>EXTERNAL_VALIDATION</span></div>

          <div class="google-sync-wrapper" title="Próximamente">
            <button
              metabolicButton
              variant="outline"
              type="button"
              [disabled]="true"
              aria-disabled="true">
              <svg class="google-icon" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M43.6 24.5c0-1.6-.14-3.1-.4-4.6H24v8.7h11a10.4 10.4 0 0 1-4.5 6.8l7.3 5.7c4.3-4 6.8-9.8 6.8-16.6z"/>
                <path fill="currentColor" d="M24 44c6.1 0 11.2-2 14.9-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.6 2.2-5.8 0-10.8-3.9-12.6-9.3l-7.5 5.8C6.2 37.7 14.4 44 24 44z"/>
                <path fill="currentColor" d="M11.4 25.7a14 14 0 0 1 0-9L3.9 11A23.3 23.3 0 0 0 0 24c0 3.7.9 7.3 2.5 10.5l7.5-5.8c-.7-1-1-2.2-1-3.5z"/>
                <path fill="currentColor" d="M24 9.5c3.3 0 6.3 1.2 8.7 3.4l6.5-6.5C35.1 3 30 1 24 1 14.4 1 6.2 7.3 2.5 16.2l7.5 5.8c1.8-5.4 6.8-9.3 12.6-9.3z"/>
              </svg>
              CONNECT_GOOGLE_LINK
            </button>
          </div>
          <div class="register-divider">
            <span>// NUEVO_OPERADOR</span>
          </div>

          <p class="switch-link">
            <a routerLink="/auth/register">RECLUTAR_AHORA</a>
          </p>
        </metabolic-card>

        <footer class="auth-footer">
          <span><i aria-hidden="true"></i>SYSTEM_ONLINE</span>
          <span>ENC: RSA_4096</span>
        </footer>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; }

    .auth-page {
      height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      position: relative;
      z-index: 1;
      overflow-y: auto;
      background: radial-gradient(ellipse at 50% 45%, rgba(6, 182, 212, 0.08) 0%, transparent 65%);
    }

    .auth-panel {
      width: min(100%, 500px);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .auth-brand {
      text-align: center;
    }

    .brand-mark {
      display: inline-block;
      padding: 10px 16px;
      border: 2px solid var(--metabolic-primary);
      color: var(--metabolic-primary);
      font: 700 clamp(2rem, 7vw, 3rem)/1 var(--metabolic-font-display);
      letter-spacing: 0.15em;
      text-shadow: 0 0 15px var(--metabolic-glow-cyan-soft);
    }

    form {
      display: grid;
      gap: 16px;
    }

    .error-prefix {
      color: #ff0055;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .field-error {
      margin: -8px 0 0;
      color: var(--metabolic-secondary);
      font: 11px var(--metabolic-font-data);
      letter-spacing: 0.06em;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .field-error.visible {
      opacity: 1;
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

    .api-error--warning {
      border-left-color: var(--metabolic-primary);
      background: rgba(6, 182, 212, 0.12);
      color: var(--metabolic-primary);
    }

    .divider {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--metabolic-text-muted);
      font: 10px var(--metabolic-font-data);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--metabolic-outline-variant);
    }

    .register-divider {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
      color: var(--metabolic-primary);
      font: 10px var(--metabolic-font-data);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.6;
    }

    .register-divider::before,
    .register-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--metabolic-primary);
      box-shadow: 0 0 4px var(--metabolic-glow-cyan-soft);
    }

    .auth-footer {
      display: flex;
      justify-content: space-between;
      color: var(--metabolic-text-muted);
      font: 700 11px var(--metabolic-font-data);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .auth-footer i {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--metabolic-tertiary);
      box-shadow: 0 0 8px var(--metabolic-tertiary);
      margin-right: 8px;
      animation: pulse-fast 2s infinite;
    }

    .switch-link {
      text-align: center;
      margin: 8px 0 0;
      font: 13px var(--metabolic-font-data);
    }

    .switch-link a {
      color: var(--metabolic-primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-decoration: none;
    }

    .switch-link a:hover {
      text-shadow: 0 0 8px var(--metabolic-glow-cyan-soft);
    }

    .google-sync-wrapper {
      display: block;
      cursor: not-allowed;
    }

    .google-sync-wrapper button {
      width: 100%;
    }

    .google-icon {
      vertical-align: middle;
      margin-right: 8px;
      filter: drop-shadow(0 0 4px var(--metabolic-glow-cyan-soft));
    }
  `]
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly submitted = signal(false);
  readonly expired = signal(false);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    this.expired.set(navigation?.extras?.state?.['expired'] === true);
  }

  showError(field: 'username' | 'password'): boolean {
    const control = this.form.controls[field];
    return (control.touched || this.submitted()) && control.invalid;
  }

  submit(): void {
    this.submitted.set(true);
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const credentials = this.form.getRawValue();

    this.auth.login(credentials).subscribe({
      next: () => {
        this.auth.me().subscribe({
          next: () => {
            this.loading.set(false);
            void this.router.navigate(['/dashboard']);
          },
          error: (err: unknown) => {
            this.loading.set(false);
            this.error.set(AuthService.extractErrorMessage(err));
          },
        });
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

}
