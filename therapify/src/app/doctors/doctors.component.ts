import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [DoctorCardComponent, FormsModule, NgForOf],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
})
export class DoctorsComponent {
  userService = inject(UserService);
  router = inject(Router);
  loggedUser = signal(this.userService.getLoggedUser());

  searchText = signal('');
  selectedDay = signal('');

  allDoctors = signal<any[]>([]);

  daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  constructor() {
    this.userService.getDoctores().subscribe((doctors) => {
      const user = this.loggedUser();
      if (user && user.userType === 'doctor') {
        this.allDoctors.set(doctors.filter((doc) => doc.id !== user.id));
      } else {
        this.allDoctors.set(doctors);
      }
    });
  }

  filteredDoctors = computed(() => {
    const text = this.searchText().toLowerCase();
    const day = this.selectedDay();
    return this.allDoctors()
      .filter(
        (doc) =>
          doc.firstName.toLowerCase().includes(text) ||
          doc.lastName.toLowerCase().includes(text) ||
          (doc.specialty && doc.specialty.toLowerCase().includes(text))
      )
      .filter((doc) => {
        if (!day) return true;
        return doc.availability && doc.availability[day]?.length > 0;
      });
  });

  setDay(day: string) {
    this.selectedDay.set(day === this.selectedDay() ? '' : day); // toggle
  }

  goToDetail(id: string) {
    this.router.navigate(['/doctor', id]);
  }
}
