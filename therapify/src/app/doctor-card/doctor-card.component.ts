import { Component, inject, input, output } from '@angular/core';
import { User } from '../../types/user';
import { KeyValuePipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-card',
  imports: [KeyValuePipe, TitleCasePipe],
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.css',
})
export class DoctorCardComponent {
  doctor = input.required<User>();
  navigate = output<string>();
  router = inject(Router);

  onClick() {
    this.navigate.emit(this.doctor().id);
  }
  goToReviews(doctorId: string) {
    // Navega al componente de reseñas pasando el doctorId
    this.router.navigate(['/reviews', doctorId]);
  }
}
