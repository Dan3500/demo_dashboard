import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard',      route: '/dashboard',     icon: 'grid_view' },
    { label: 'Especialidades', route: '/especialidades', icon: 'work' },
    { label: 'Niveles',        route: '/niveles',         icon: 'layers' },
    { label: 'Competencias',   route: '/competencias',   icon: 'track_changes' },
    { label: 'Personas',       route: '/personas',       icon: 'group' },
    { label: 'Evaluaciones',   route: '/evaluaciones',   icon: 'assignment_turned_in' },
    { label: 'Informes',       route: '/informes',       icon: 'bar_chart' },
  ];

  collapsed = signal(false);

  constructor(private readonly authService: AuthService) {}

  toggle(): void {
    this.collapsed.update((v) => !v);
  }

  get admin() {
    return this.authService.admin();
  }

  get initials(): string {
    const name = this.admin?.name ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
