import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'therapify';
  userService = inject(UserService);
  router = inject(Router);

  protected readonly toast = toast;

  isDemoSession = computed(() => {
    return this.userService.isDemoSignal();
  });

  demoRoleLabel = computed(() => {
    const user = this.userService.getLoggedUser();
    if (user?.userType === 'DOCTOR') {
      return 'Terapeuta';
    }
    return 'Paciente';
  });
}
