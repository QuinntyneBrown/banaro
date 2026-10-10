import { Routes } from '@angular/router';
import { OfflinePage } from './pages/offline/offline';
import { resetPasswordResolver } from './pages/reset-password/reset-password.resolver';
import { verifyEmailResolver } from './pages/verify-email/verify-email.resolver';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.HomePage) },
  { path: 'about', loadComponent: () => import('./pages/about/about').then((m) => m.AboutPage) },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
  },
  { path: 'join', loadComponent: () => import('./pages/join/join').then((m) => m.JoinPage) },
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in').then((m) => m.SignInPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    resolve: { linkUsable: resetPasswordResolver },
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'verify-email',
    resolve: { outcome: verifyEmailResolver },
    loadComponent: () => import('./pages/verify-email/verify-email').then((m) => m.VerifyEmailPage),
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
