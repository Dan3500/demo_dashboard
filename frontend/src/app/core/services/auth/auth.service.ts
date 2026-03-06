import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { env } from '../../../env/env';
import { ResponseModel } from '../../models/API/Response';
import { AdminModel } from '../../models/auth/Admin';
import { LoginData } from '../../models/auth/LoginData';
import { LoginRequest } from '../../models/auth/LoginRequest';

/**
 * Servicio de autenticación para manejar el login, logout y estado de autenticación del usuario.
 * Utiliza localStorage para persistir el token y los datos del administrador, y un signal para mantener el estado en la aplicación.
 */
const TOKEN_KEY = 'auth_token';
const ADMIN_KEY = 'auth_admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _admin = signal<AdminModel | null>(this.loadAdmin());

  readonly admin = this._admin.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(credentials: LoginRequest): Observable<ResponseModel<LoginData>> {
    return this.http
      .post<ResponseModel<LoginData>>(`${env.apiUrl}/auth/v1/login`, credentials)
      // Guardamos el token y los datos del admin en localStorage y en el signal
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            localStorage.setItem(TOKEN_KEY, res.data.token);
            localStorage.setItem(ADMIN_KEY, JSON.stringify(res.data.admin));
            this._admin.set(res.data.admin);
          }
        }),
      );
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    this._admin.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Método para obtener los datos del administrador autenticado
  private loadAdmin(): AdminModel | null {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? (JSON.parse(raw) as AdminModel) : null;
  }
}
