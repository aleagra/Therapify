import { Component, inject, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { concat, of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { FormsModule } from '@angular/forms';
import { DAY_LABELS, DAYS_OF_WEEK } from '../../types/constants';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [DoctorCardComponent, FormsModule, SkeletonComponent],
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
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  mobileFiltersOpen = signal(false);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedSpecialty()) count++;
    if (this.maxDistance()) count++;
    if (this.selectedGender()) count++;
    if (this.selectedDay()) count++;
    return count;
  });

  toggleMobileFilters() {
    this.mobileFiltersOpen.update((v) => !v);
  }

  private skeletonShownTime: number | null = null;

  // Pipeline reactivo: 150ms delay anti-parpadeo + 350ms de permanencia mínima si el skeleton llega a mostrarse
  private readonly skeletonState = toSignal(
    toObservable(this.isLoading).pipe(
      switchMap((loading) => {
        if (loading) {
          this.skeletonShownTime = null;
          return concat(
            of({ displayLoading: true, showSkeleton: false }),
            timer(150).pipe(
              tap(() => {
                this.skeletonShownTime = Date.now();
              }),
              map(() => ({ displayLoading: true, showSkeleton: true })),
            ),
          );
        } else {
          if (this.skeletonShownTime !== null) {
            const elapsed = Date.now() - this.skeletonShownTime;
            const remaining = Math.max(0, 350 - elapsed);
            this.skeletonShownTime = null;
            if (remaining > 0) {
              return timer(remaining).pipe(
                map(() => ({ displayLoading: false, showSkeleton: false })),
              );
            }
          }
          this.skeletonShownTime = null;
          return of({ displayLoading: false, showSkeleton: false });
        }
      }),
    ),
    { initialValue: { displayLoading: true, showSkeleton: false } },
  );

  showSkeleton = computed(() => this.skeletonState().showSkeleton);
  displayLoading = computed(() => this.skeletonState().displayLoading);

  readonly skeletonCards = [1, 2, 3, 4, 5, 6];

  DAYS_OF_WEEK = DAYS_OF_WEEK;
  DAY_LABELS = DAY_LABELS;

  getDayLabel(day: string): string {
    return (this.DAY_LABELS as Record<string, string>)[day] || day;
  }

  constructor() {
    this.fetchDoctors();
  }

  fetchDoctors() {
    this.isLoading.set(true);
    this.loadError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.userService.getDoctorsNear(lat, lng).subscribe({
          next: (doctors) => {
            this.mapDoctors(doctors);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('❌ Error obteniendo doctores cercanos', error);
            this.loadFallback();
          },
        });
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación', error);
        this.loadFallback();
      },
    );
  }

  private loadFallback() {
    this.userService.getDoctores().subscribe({
      next: (doctors) => {
        this.mapDoctors(doctors);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando doctores', err);
        this.loadError.set('No pudimos cargar la lista de profesionales. Por favor, revisá tu conexión e intentá nuevamente.');
        this.isLoading.set(false);
      },
    });
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

  hasActiveFilters = computed(() => {
    return !!(
      this.searchText() ||
      this.selectedDay() ||
      this.maxDistance() !== '' ||
      this.selectedGender() ||
      this.selectedSpecialty()
    );
  });

  clearFilters() {
    this.searchText.set('');
    this.selectedDay.set('');
    this.maxDistance.set('');
    this.selectedGender.set('');
    this.selectedSpecialty.set('');
  }

  setDay(day: string) {
    this.selectedDay.set(day === this.selectedDay() ? '' : day);
  }

  goToDetail(id: string) {
    this.router.navigate(['/doctor', id]);
  }
}
