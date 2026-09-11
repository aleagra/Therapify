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
        title: 'Iniciar Sesión | Therapify',
        loadComponent: () =>
          import('./login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Crear Cuenta | Therapify',
        loadComponent: () =>
          import('./register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'forgot-password',
        title: 'Recuperar Contraseña | Therapify',
        loadComponent: () =>
          import('./forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        title: 'Restablecer Contraseña | Therapify',
        loadComponent: () =>
          import('./reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      {
        path: 'verify-email',
        title: 'Verificar Email | Therapify',
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
        title: 'Therapify | Red de Terapeutas y Psicólogos en Argentina',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'about-us',
        title: 'Sobre Nosotros | Therapify',
        loadComponent: () =>
          import('./about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'doctor/:id',
        title: 'Detalle del Profesional | Therapify',
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
        title: 'Mi Perfil | Therapify',
        loadComponent: () =>
          import('./profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'doctors',
        title: 'Profesionales y Terapeutas Disponibles | Therapify',
        loadComponent: () =>
          import('./doctors/doctors.component').then(
            (m) => m.DoctorsComponent,
          ),
        canActivate: [authGuard],
        data: { preload: true },
      },
      {
        path: 'profile-doctor',
        title: 'Panel Profesional | Therapify',
        loadComponent: () =>
          import('./profile-doctor/profile-doctor.component').then(
            (m) => m.ProfileDoctorComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'appointments',
        title: 'Mis Turnos | Therapify',
        loadComponent: () =>
          import('./turnos/turnos.component').then((m) => m.TurnosComponent),
        canActivate: [authGuard],
      },
      {
        path: 'turnos',
        redirectTo: 'appointments',
        pathMatch: 'full',
      },
      {
        path: 'reviews/:id',
        title: 'Reseñas del Profesional | Therapify',
        loadComponent: () =>
          import('./reviews/reviews.component').then(
            (m) => m.ReviewsComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'users',
        title: 'Administración de Usuarios | Therapify',
        loadComponent: () =>
          import('./users/users.component').then((m) => m.UsersComponent),
        canActivate: [adminGuard],
      },
    ],
  },

  {
    path: '**',
    title: 'Página no encontrada | Therapify',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
