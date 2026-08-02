import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Envía y recibe cookies (httpOnly refresh token) en todas las peticiones XHR.
 * Sin esto, el browser no enviaría el cookie `refresh_token` al backend.
 */
export const credentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const authorized = request.clone({ withCredentials: true });
  return next(authorized);
};
