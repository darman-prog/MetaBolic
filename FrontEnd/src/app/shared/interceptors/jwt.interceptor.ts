import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

function addToQueue(): Observable<string> {
  return new Observable<string>(observer => {
    refreshQueue.push({
      resolve: token => {
        observer.next(token);
        observer.complete();
      },
      reject: error => {
        observer.error(error);
      },
    });
  });
}

function processQueue(token: string | null, error: unknown | null): void {
  refreshQueue.forEach(item => {
    if (token) {
      item.resolve(token);
    } else {
      item.reject(error);
    }
  });
  refreshQueue.length = 0;
}

function navigateToLogin(router: Router): void {
  void router.navigate(['/auth/login'], { state: { expired: true } });
}

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

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

      if (error.status !== 401 || !auth.refreshToken || isAuthRequest) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        return auth.refresh().pipe(
          switchMap(response => {
            isRefreshing = false;
            processQueue(response.access, null);
            return next(
              request.clone({
                setHeaders: { Authorization: `Bearer ${response.access}` },
              })
            );
          }),
          catchError(refreshError => {
            isRefreshing = false;
            processQueue(null, refreshError);
            auth.logout();
            navigateToLogin(router);
            return throwError(() => refreshError);
          })
        );
      }

      return addToQueue().pipe(
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
