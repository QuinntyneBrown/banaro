import { Routes } from '@angular/router';
import { OfflinePage } from './pages/offline/offline';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.HomePage) },
  { path: 'about', loadComponent: () => import('./pages/about/about').then((m) => m.AboutPage) },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.PrivacyPage),
  },
  {
    path: '500',
    loadComponent: () => import('./pages/server-error/server-error').then((m) => m.ServerErrorPage),
  },
  { path: 'offline', component: OfflinePage },
  {
    path: 'maintenance',
    loadComponent: () => import('./pages/maintenance/maintenance').then((m) => m.MaintenancePage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
