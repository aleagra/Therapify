import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { PrivateLayoutComponent } from './private-layout/private-layout.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';

export const routes: Routes = [
  // Debe ir primero: si no, el router hace match con el primer layout de la
  // lista (AuthLayoutComponent) para la URL raíz "/" y deja su router-outlet
  // vacío, en vez de retroceder a buscar el layout correcto.
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent,
          ),
      },
    ],
  },

  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'doctor/:id',
        loadComponent: () =>
          import('./doctor-detail/doctor-detail.component').then(
            (m) => m.DoctorDetailComponent,
          ),
      },
    ],
  },

  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./doctors/doctors.component').then(
            (m) => m.DoctorsComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile-doctor',
        loadComponent: () =>
          import('./profile-doctor/profile-doctor.component').then(
            (m) => m.ProfileDoctorComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./turnos/turnos.component').then((m) => m.TurnosComponent),
        canActivate: [authGuard],
      },
      {
        path: 'reviews/:id',
        loadComponent: () =>
          import('./reviews/reviews.component').then(
            (m) => m.ReviewsComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/users.component').then((m) => m.UsersComponent),
        canActivate: [adminGuard],
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
