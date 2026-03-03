import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

/**
 * Interceptor para agregar el token de autenticación a las solicitudes HTTP salientes.
 * @param req La solicitud HTTP entrante.
 * @param next El siguiente interceptor en la cadena.
 * @returns La solicitud HTTP modificada con el token de autenticación.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
