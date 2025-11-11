import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';
import { NavbarComponent } from './navbar/navbar.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: NavbarComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
