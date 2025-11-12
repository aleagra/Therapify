import { Component, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';

@Component({
  selector: 'app-doctors',
  imports: [DoctorCardComponent],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css',
})
export class DoctorsComponent {
  userService = inject(UserService);
  doctors = toSignal(this.userService.getDoctores());
}
