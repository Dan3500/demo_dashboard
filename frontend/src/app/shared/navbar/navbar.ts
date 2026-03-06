import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth/auth.service';
import { DOCUMENT } from '@angular/common';

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
   ];

  collapsed = signal(false);
  isDarkMode = signal(false);

  private document = inject(DOCUMENT);

  constructor(private readonly authService: AuthService) {
    const savedTheme = localStorage.getItem('dark-mode');
    if (savedTheme === 'true') {
      this.isDarkMode.set(true);
      this.document.body.classList.add('dark');
    }
  }

  toggle(): void {
    this.collapsed.update((v) => !v);
  }

  toggleTheme(): void {
    this.isDarkMode.update((v) => !v);
    const isDark = this.isDarkMode();
    this.document.body.classList.toggle('dark', isDark);
    localStorage.setItem('dark-mode', isDark.toString());
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
