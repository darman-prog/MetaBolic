import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  {
    path: '', component: AppShellComponent, canActivateChild: [authGuard], children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'biometric-sync', loadChildren: () => import('./features/biometric-sync/biometric-sync.routes').then(m => m.BIOMETRIC_ROUTES) },
      { path: 'protocols', loadChildren: () => import('./features/protocols/protocols.routes').then(m => m.PROTOCOLS_ROUTES) },
      { path: 'missions', loadChildren: () => import('./features/missions/missions.routes').then(m => m.MISSIONS_ROUTES) },
      { path: 'progress', loadChildren: () => import('./features/progress/progress.routes').then(m => m.PROGRESS_ROUTES) },
    ]
  },
  { path: '**', redirectTo: 'auth/boot' }
];
