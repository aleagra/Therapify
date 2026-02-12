import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { DAY_LABELS, DAYS_OF_WEEK } from '../../types/constants';

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

  DAYS_OF_WEEK = DAYS_OF_WEEK;
  DAY_LABELS = DAY_LABELS;

  constructor() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.userService.getDoctorsNear(lat, lng).subscribe((doctors) => {
          this.mapDoctors(doctors);
        });
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación', error);

        // Fallback si no da permiso
        this.userService.getDoctores().subscribe((doctors) => {
          this.mapDoctors(doctors);
        });
      },
    );
  }

  // 🔹 NUEVO MÉTODO
  private mapDoctors(doctors: any[]) {
    const user = this.loggedUser();

    const mappedDoctors = doctors.map((d) => ({
      ...d,
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      specialty: d.specialty || '',
      description: d.description || '',
      schedule: d.schedule || {},
      availability: d.availability || {},
      distanceKm: d.distanceKm ?? null,
    }));

    if (user && user.userType === 'DOCTOR') {
      this.allDoctors.set(mappedDoctors.filter((doc) => doc.id !== user.id));
    } else {
      this.allDoctors.set(mappedDoctors);
    }
  }

  // =====================
  // FILTROS (SIN CAMBIOS)
  // =====================
  filteredDoctors = computed(() => {
    const text = this.searchText().toLowerCase().trim();
    const day = this.selectedDay();

    return this.allDoctors()
      .filter((doc) => {
        const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
        const specialty = doc.specialty?.toLowerCase() || '';
        return fullName.includes(text) || specialty.includes(text);
      })
      .filter((doc) => {
        if (!day) return true;
        return doc.availability && doc.availability[day]?.length > 0;
      });
  });

  setDay(day: string) {
    this.selectedDay.set(day === this.selectedDay() ? '' : day);
  }

  goToDetail(id: string) {
    this.router.navigate(['/doctor', id]);
  }
}
