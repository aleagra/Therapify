import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctors',
  imports: [DoctorCardComponent],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css',
})
export class DoctorsComponent {
  userService = inject(UserService);
  router = inject(Router);
  doctors = toSignal(this.userService.getDoctores());

  goToDetail(id: string) {
    this.router.navigate(['/doctor', id]); // ✅ redirige al detalle
  }
}
