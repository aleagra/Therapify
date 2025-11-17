import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { DoctorDetailComponent } from './doctor-detail/doctor-detail.component';
import { TurnosComponent } from './turnos/turnos.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { UsersComponent } from './users/users.component';
import { adminGuard } from './guards/admin.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProfileDoctorComponent } from './profile-doctor/profile-doctor.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'doctors', component: DoctorsComponent, canActivate: [authGuard] },
  {
    path: 'profile-doctor',
    component: ProfileDoctorComponent,
    canActivate: [authGuard],
  },
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

  {
    path: 'reviews/:id',
    component: ReviewsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'about-us',
    component: AboutComponent,
  },

  {
    path: 'users',
    component: UsersComponent,
    canActivate: [adminGuard],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];
