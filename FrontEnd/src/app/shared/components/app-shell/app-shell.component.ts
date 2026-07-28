import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavComponent } from '../sidebar-nav/sidebar-nav.component';

/**
 * Shell principal de la aplicación.
 * Contiene el sidebar fijo, topbar y área de contenido.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sidebar-nav />
    <div class="shell">
      <header class="topbar">
        <div class="topbar__left">
          <span class="topbar__date">WEDNESDAY 10</span>
          <span class="topbar__separator" aria-hidden="true"></span>
          <span class="topbar__month">JUNE</span>
        </div>
        <div class="topbar__right">
          <button class="topbar__icon" type="button" aria-label="Notificaciones">
            <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
          </button>
          <div class="topbar__profile">
            <div class="topbar__profile-meta">
              <span class="topbar__rank">Rank: Vanguard</span>
              <span class="topbar__operator">Operator_042</span>
            </div>
            <button class="topbar__avatar" type="button" aria-label="Perfil de usuario">
              <span class="material-symbols-outlined" aria-hidden="true">account_circle</span>
            </button>
          </div>
        </div>
      </header>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .shell {
      min-height: 100dvh;
      margin-left: var(--metabolic-sidebar-width);
    }

    .topbar {
      position: fixed;
      z-index: 50;
      top: 0;
      right: 0;
      left: var(--metabolic-sidebar-width);
      height: var(--metabolic-nav-height);
      padding: 0 var(--metabolic-margin-desktop);
      border-bottom: 1px solid var(--metabolic-grid-line);
      background: rgba(7, 13, 31, 0.75);
      backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .topbar__left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topbar__date {
      color: var(--metabolic-text);
      font: 700 18px/1 var(--metabolic-font-data);
      letter-spacing: -0.04em;
      text-transform: uppercase;
    }

    .topbar__month {
      color: var(--metabolic-text-muted);
      font: 700 18px/1 var(--metabolic-font-data);
      letter-spacing: -0.04em;
      text-transform: uppercase;
    }

    .topbar__separator {
      width: 1px;
      height: 16px;
      background: var(--metabolic-grid-line);
    }

    .topbar__right {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .topbar__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 0;
      background: transparent;
      color: var(--metabolic-primary);
      cursor: pointer;
      transition: filter 0.2s ease;
    }

    .topbar__icon:hover {
      filter: drop-shadow(0 0 6px var(--metabolic-glow-cyan-soft));
    }

    .topbar__profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topbar__profile-meta {
      text-align: right;
    }

    .topbar__rank {
      display: block;
      color: var(--metabolic-primary);
      font: 700 11px/1.4 var(--metabolic-font-data);
      text-transform: uppercase;
    }

    .topbar__operator {
      display: block;
      color: var(--metabolic-text);
      font: 700 13px/1.4 var(--metabolic-font-data);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .topbar__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 0;
      background: transparent;
      color: var(--metabolic-primary);
      cursor: pointer;
    }

    .topbar__avatar .material-symbols-outlined {
      font-size: 32px;
    }

    .content {
      max-width: 1500px;
      padding: calc(var(--metabolic-nav-height) + 40px) var(--metabolic-margin-desktop) 56px;
      margin: auto;
    }

    @media (max-width: 900px) {
      .shell { margin-left: 0; }
      .topbar { left: 0; padding-left: 72px; }
      .content { padding: calc(var(--metabolic-nav-height) + 28px) var(--metabolic-margin-mobile) 40px; }
      .topbar__profile-meta { display: none; }
    }
  `]
})
export class AppShellComponent {}
