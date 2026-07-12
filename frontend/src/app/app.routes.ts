import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    title: 'SoftTeamGlobal - Dashboard'
  },
  {
    path: 'departments',
    loadComponent: () => import('./features/departmens/departmens').then(m => m.Departmens),
    title: 'SoftTeamGlobal - Department'
  },
  {
    path: 'departments/:id',
    loadComponent: () => import('./features/departments-detail/departments-detail').then(m => m.DepartmentsDetail),
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];