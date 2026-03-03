import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { LoginRequest } from '../../core/models/auth/LoginRequest';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  credentials: LoginRequest = { email: '', password: '' };
  errorMsg = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  /**
   * Maneja el envío del formulario de login. Intenta autenticar al usuario con las credenciales proporcionadas.
   * Si la autenticación es exitosa, redirige al dashboard. Si falla, muestra un mensaje de error.
   */
  onSubmit(): void {
    this.errorMsg.set(null);
    this.loading.set(true);

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMsg.set(res.error?.message ?? 'Error desconocido');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err?.error?.error?.message ?? 'Error de conexión con el servidor',
        );
      },
    });
  }
}
