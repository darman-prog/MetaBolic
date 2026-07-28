import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;
  const authorized = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authorized).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status !== 401 || !auth.refreshToken || request.url.includes('/token/refresh')) return throwError(() => error);
    return auth.refresh().pipe(switchMap(() => next(request.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken}` } }))), catchError(refreshError => { auth.logout(); return throwError(() => refreshError); }));
  }));
};
