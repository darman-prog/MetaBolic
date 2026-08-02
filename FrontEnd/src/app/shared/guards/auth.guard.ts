import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = Number(payload?.exp);
    if (!exp) return false;
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.accessToken;
  if (!token) return router.createUrlTree(['/auth/login']);
  if (isTokenExpired(token)) {
    auth.logout();
    return router.createUrlTree(['/auth/login'], { queryParams: { expired: '1' } });
  }
  return true;
};
