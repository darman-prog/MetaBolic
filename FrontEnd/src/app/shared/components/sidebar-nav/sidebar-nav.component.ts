import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

/**
 * Sidebar de navegación principal.
 * En mobile se comporta como drawer con overlay.
 */
@Component({
  selector: 'sidebar-nav',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="mobile-toggle"
      type="button"
      aria-label="Abrir navegación"
      aria-expanded="false"
      (click)="open.set(!open())">
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>

    <aside
      class="sidebar"
      [class.sidebar--open]="open()"
      aria-label="Navegación principal">
      <div class="brand">
        <span class="brand__title">METABOLIC</span>
        <small class="brand__subtitle">NEURAL FITNESS OS</small>
      </div>

      <nav>
        <a
          *ngFor="let item of items"
          [routerLink]="item.route"
          routerLinkActive="active"
          (click)="open.set(false)">
          <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
          <span class="nav__label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="operator">
        <span class="operator__dot" aria-hidden="true"></span>
        <div class="operator__info">
          <strong>OPERATOR_042</strong>
          <small>STATUS: NOMINAL</small>
        </div>
        <button
          class="operator__logout"
          type="button"
          aria-label="Cerrar sesión"
          (click)="logout()">
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
        </button>
      </div>
    </aside>

    <div
      class="scrim"
      [class.scrim--visible]="open()"
      (click)="open.set(false)"
      aria-hidden="true"></div>
  `,
  styles: [`
    :host { display: block; }

    .sidebar {
      position: fixed;
      z-index: 60;
      inset: 0 auto 0 0;
      width: var(--metabolic-sidebar-width);
      padding: 32px 0 24px;
      border-right: 1px solid var(--metabolic-grid-line);
      background: rgba(10, 16, 31, 0.92);
      backdrop-filter: blur(18px);
      box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.1);
      display: flex;
      flex-direction: column;
    }

    .brand {
      padding: 0 28px 28px;
      border-bottom: 1px solid var(--metabolic-grid-line);
    }

    .brand__title {
      display: block;
      color: var(--metabolic-primary);
      font: 700 22px/1.1 var(--metabolic-font-display);
      letter-spacing: 0.15em;
      text-shadow: 0 0 10px var(--metabolic-glow-cyan-soft);
      text-transform: uppercase;
    }

    .brand__subtitle,
    .operator__info small {
      display: block;
      margin-top: 8px;
      color: var(--metabolic-text-dim);
      font: 10px/1 var(--metabolic-font-data);
      letter-spacing: 0.12em;
    }

    nav {
      padding: 24px 0;
      display: grid;
      gap: 4px;
    }

    nav a {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 15px 28px;
      border-left: 4px solid transparent;
      color: var(--metabolic-text-muted);
      font: 700 12px/1 var(--metabolic-font-data);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    }

    nav a:hover,
    nav a.active {
      color: var(--metabolic-primary);
      background: rgba(6, 182, 212, 0.12);
      border-left-color: var(--metabolic-primary);
    }

    nav a .material-symbols-outlined {
      font-size: 20px;
      width: 24px;
      text-align: center;
    }

    .operator {
      margin: auto 20px 0;
      padding: 16px 0 0;
      border-top: 1px solid var(--metabolic-grid-line);
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--metabolic-text);
    }

    .operator__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--metabolic-tertiary);
      box-shadow: 0 0 8px var(--metabolic-tertiary);
      flex-shrink: 0;
    }

    .operator__info {
      flex: 1;
      min-width: 0;
    }

    .operator__info strong {
      display: block;
      font: 700 11px/1.4 var(--metabolic-font-data);
      letter-spacing: 0.04em;
    }

    .operator__logout {
      margin-left: auto;
      border: 0;
      background: none;
      color: var(--metabolic-text-muted);
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .operator__logout:hover {
      color: var(--metabolic-secondary);
    }

    .mobile-toggle,
    .scrim {
      display: none;
    }

    @media (max-width: 900px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }

      .sidebar--open {
        transform: translateX(0);
      }

      .mobile-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        z-index: 70;
        top: 16px;
        left: 16px;
        width: 40px;
        height: 40px;
        border: 1px solid var(--metabolic-primary);
        color: var(--metabolic-primary);
        background: var(--metabolic-surface-dark);
        cursor: pointer;
      }

      .scrim {
        display: block;
        position: fixed;
        z-index: 55;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.25s ease, visibility 0.25s ease;
      }

      .scrim--visible {
        opacity: 1;
        visibility: visible;
      }
    }
  `]
})
export class SidebarNavComponent {
  readonly open = signal(false);

  readonly items: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'settings_input_component' },
    { label: 'Protocolos', route: '/protocols', icon: 'terminal' },
    { label: 'Misiones', route: '/missions', icon: 'assignment_late' },
    { label: 'Evolución', route: '/progress', icon: 'show_chart' },
    { label: 'Biometría', route: '/biometric-sync', icon: 'vital_signs' },
  ];

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login']);
  }
}
