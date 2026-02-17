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
  maxDistance = signal<number | ''>('');
  selectedGender = signal<string>('');
  allDoctors = signal<any[]>([]);
  selectedSpecialty = signal<string>('');

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

        this.userService.getDoctores().subscribe((doctors) => {
          this.mapDoctors(doctors);
        });
      },
    );
  }

  private mapDoctors(doctors: any[]) {
    const user = this.loggedUser();

    const mappedDoctors = doctors.map((d) => ({
      ...d,
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      specialty: (d.specialty ?? '').toString().trim().toUpperCase(),
      description: d.description || '',
      schedule: d.schedule || {},
      availability: d.availability || {},
      distanceKm: d.distanceKm ?? null,
      gender: d.gender || '',
    }));

    if (user && user.userType === 'DOCTOR') {
      this.allDoctors.set(mappedDoctors.filter((doc) => doc.id !== user.id));
    } else {
      this.allDoctors.set(mappedDoctors);
    }
  }

  filteredDoctors = computed(() => {
    const text = this.searchText().toLowerCase().trim();
    const day = this.selectedDay();
    const dist = this.maxDistance();
    const gender = this.selectedGender();
    const specialtySelected = this.selectedSpecialty();

    return this.allDoctors()
      .filter((doc) => {
        if (!text) return true;
        const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
        return fullName.includes(text);
      })

      .filter((doc) => {
        if (!day) return true;
        return doc.availability && doc.availability[day]?.length > 0;
      })

      .filter((doc) => {
        if (!dist) return true;
        if (doc.distanceKm == null) return true;
        return doc.distanceKm <= dist;
      })

      .filter((doc) => {
        if (!gender) return true;
        return doc.gender === gender;
      })

      .filter((doc) => {
        if (!specialtySelected) return true;

        const docSpec = (doc.specialty ?? '').toString().trim().toUpperCase();
        const selectedSpec = specialtySelected.toString().trim().toUpperCase();

        return docSpec === selectedSpec;
      });
  });

  setDay(day: string) {
    this.selectedDay.set(day === this.selectedDay() ? '' : day);
  }

  goToDetail(id: string) {
    this.router.navigate(['/doctor', id]);
  }
}
