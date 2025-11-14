import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { DoctorDetailComponent } from './doctor-detail/doctor-detail.component';
import { TurnosComponent } from './turnos/turnos.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: NavbarComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'doctors', component: DoctorsComponent, canActivate: [authGuard] },
  {
    path: 'appointments',
    component: TurnosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'doctor/:id',
    component: DoctorDetailComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
