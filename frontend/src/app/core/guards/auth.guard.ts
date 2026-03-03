import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Guardia de autenticación para proteger rutas que requieren que el usuario esté autenticado.
 * Verifica si el usuario tiene un token de autenticación válido antes de permitir el acceso a la ruta.
 * Si el usuario no está autenticado, redirige a la página de login.
 * @returns 
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isGuestRoute = !!route.data['guest'];

  if (isGuestRoute) {
    // Solo accesible para usuarios no autenticados
    return auth.isAuthenticated()
      ? router.createUrlTree(['/dashboard'])
      : true;
  }

  // Ruta protegida: solo accesible para usuarios autenticados
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login']);
};
