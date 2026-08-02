import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RefreshStateService } from '../services/refresh-state.service';

function navigateToLogin(router: Router): void {
  void router.navigate(['/auth/login'], { state: { expired: true } });
}

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const refreshState = inject(RefreshStateService);

  const token = auth.accessToken;
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest =
        request.url.includes('/auth/login/') ||
        request.url.includes('/auth/refresh/') ||
        request.url.includes('/auth/register/');

      if (error.status !== 401 || !auth.accessToken || isAuthRequest) {
        return throwError(() => error);
      }

      if (!refreshState.isRefreshing) {
        refreshState.startRefresh();
        return auth.refresh().pipe(
          switchMap(response => {
            refreshState.finishRefresh();
            refreshState.processQueue(response.access, null);
            return next(
              request.clone({
                setHeaders: { Authorization: `Bearer ${response.access}` },
              })
            );
          }),
          catchError(refreshError => {
            refreshState.finishRefresh();
            refreshState.processQueue(null, refreshError);
            auth.logout();
            navigateToLogin(router);
            return throwError(() => refreshError);
          })
        );
      }

      return refreshState.enqueue().pipe(
        switchMap(newToken =>
          next(
            request.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            })
          )
        ),
        catchError(queueError => throwError(() => queueError))
      );
    })
  );
};
