import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { UserService } from '../services/user.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, NgIf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  menuOpen = false;
  userService = inject(UserService);
  router = inject(Router);

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  get authButtonLabel(): string {
    if (this.userService.isLoggedSignal()) {
      return 'Cerrar sesión';
    }
    if (this.router.url.startsWith('/login')) {
      return 'Registrate';
    }
    return 'Iniciar sesión';
  }

  handleLoginLogout() {
    if (this.userService.isLoggedSignal()) {
      this.userService.logout();
      this.router.navigate(['/login']);
    } else if (this.router.url.startsWith('/login')) {
      this.router.navigate(['/register']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
