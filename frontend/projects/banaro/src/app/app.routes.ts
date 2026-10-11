import { Routes } from '@angular/router';
import { memberGuard, onboardingGuard } from 'api';
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
    path: 'builders',
    loadComponent: () => import('./pages/directory/directory').then((m) => m.DirectoryPage),
  },
  {
    path: 'builders/:id',
    loadComponent: () =>
      import('./pages/builder-profile/builder-profile').then((m) => m.BuilderProfilePage),
  },
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
    path: 'welcome',
    canMatch: [onboardingGuard],
    loadComponent: () => import('./pages/onboarding/onboarding').then((m) => m.OnboardingPage),
  },
  {
    path: 'projects/new',
    canMatch: [memberGuard],
    loadComponent: () => import('./pages/project-new/project-new').then((m) => m.ProjectNewPage),
  },
  {
    path: 'settings',
    canMatch: [memberGuard],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsPage),
    children: [
      // Account comes with L2-035; until then Settings opens on Privacy (D-047).
      { path: '', pathMatch: 'full', redirectTo: 'privacy' },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./pages/settings/privacy/privacy-settings').then((m) => m.PrivacySettingsSection),
      },
      {
        path: 'blocked',
        loadComponent: () =>
          import('./pages/settings/blocked/blocked-builders').then((m) => m.BlockedBuildersSection),
      },
    ],
  },
  {
    path: 'profile/edit',
    canMatch: [memberGuard],
    loadComponent: () => import('./pages/profile-edit/profile-edit').then((m) => m.ProfileEditPage),
  },
  {
    path: 'verify-email',
    resolve: { outcome: verifyEmailResolver },
    loadComponent: () => import('./pages/verify-email/verify-email').then((m) => m.VerifyEmailPage),
  },
  {
    path: 'code-of-conduct',
    loadComponent: () =>
      import('./pages/code-of-conduct/code-of-conduct').then((m) => m.CodeOfConductPage),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.PrivacyPage),
  },
  {
    path: '500',
    loadComponent: () => import('./pages/server-error/server-error').then((m) => m.ServerErrorPage),
  },
  {
    path: '403',
    loadComponent: () => import('./pages/forbidden/forbidden').then((m) => m.ForbiddenPage),
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
