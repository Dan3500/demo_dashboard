import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [authGuard],
    data: { guest: true },
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/content/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'especialidades',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/content/base/base').then((m) => m.Base),
    data: {
      entity: 'speciality',
      title: 'Especialidades',
      description: 'Gestión de especialidades profesionales',
      actionLabel: 'Nueva especialidad',
    },
  },
  {
    path: 'niveles',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/content/base/base').then((m) => m.Base),
    data: {
      entity: 'level',
      title: 'Niveles',
      description: 'Gestión de niveles de carrera y su requisitos',
      actionLabel: 'Nuevo nivel',
    },
  },
  {
    path: 'competencias',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/content/base/base').then((m) => m.Base),
    data: {
      entity: 'competency',
      title: 'Competencias',
      description: 'Gestión de competencias evaluables de las personas',
      actionLabel: 'Nueva competencia',
    },
  },
  {
    path: 'personas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/content/base/base').then((m) => m.Base),
    data: {
      entity: 'person',
      title: 'Personas',
      description: 'Gestión de empleados y su progreso profesional',
      actionLabel: 'Nueva persona',
    },
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
