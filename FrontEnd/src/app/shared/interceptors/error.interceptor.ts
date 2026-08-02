import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../components/toast/toast.service';
import { AuthService } from '../services/auth.service';

const AUTH_ROUTES = ['/auth/login/', '/auth/register/', '/auth/refresh/'];

function isAuthRequest(url: string): boolean {
  return AUTH_ROUTES.some(route => url.includes(route));
}

function httpMessage(error: HttpErrorResponse): string {
  if (error.error && typeof error.error === 'object') {
    const messages = Object.entries(error.error)
      .map(([field, value]) => {
        const text = Array.isArray(value) ? value.join(', ') : String(value);
        return `${field}: ${text}`;
      })
      .join(' | ');
    if (messages) return messages;
  }
  return `Error ${error.status}: ${error.statusText}`;
}

/**
 * Manejo centralizado de errores HTTP.
 *
 * - Las rutas de autenticación (login/register/refresh) son ignoradas; esos
 *   errores los sigue gestionando el componente correspondiente para mostrar
 *   mensajes inline específicos.
 * - 401: ya lo gestiona el jwtInterceptor (refresh + logout + redirect); aquí
 *   no hacemos nada para no duplicar.
 * - Resto de códigos: muestra un toast de error y re-lanza el error para que
 *   el componente pueda discriminar si quiere.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isAuthRequest(request.url)) {
        return throwError(() => error);
      }
      if (error.status === 401) {
        return throwError(() => error);
      }
      if (error.status === 0) {
        toast.error('No se pudo conectar con el servidor.');
      } else {
        toast.error(httpMessage(error));
      }
      if (error.status === 403) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
