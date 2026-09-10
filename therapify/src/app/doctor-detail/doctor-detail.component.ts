import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { CalendarComponent } from '../calendar/calendar.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { InitialsPipe } from '../pipes/initials.pipe';
import { SpecialtyLabelPipe } from '../pipes/specialty-label.pipe';
import { ScheduleRangePipe } from '../pipes/schedule-range.pipe';
import { DAY_LABELS, DAYS_OF_WEEK } from '../../types/constants';
import { User } from '../../types/user';
import { concat, of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [
    CalendarComponent,
    RouterLink,
    SkeletonComponent,
    InitialsPipe,
    SpecialtyLabelPipe,
    ScheduleRangePipe,
  ],
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private doctorService = inject(UserService);
  private router = inject(Router);
  private location = inject(Location);
  private titleService = inject(Title);

  id = this.route.snapshot.paramMap.get('id')!;
  doctor = signal<User | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  get doctorRating(): number | undefined {
    const r = this.doctor()?.averageRating ?? (this.doctor() as any)?.rating;
    return r !== undefined && r !== null && !isNaN(Number(r))
      ? Number(r)
      : undefined;
  }

  private skeletonShownTime: number | null = null;

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

  DAYS_OF_WEEK = DAYS_OF_WEEK;
  DAY_LABELS = DAY_LABELS;

  specialtyLabels: Record<string, string> = {
    PSICOLOGIA_CLINICA: 'Psicología clínica',
    TERAPIA_COGNITIVO_CONDUCTUAL: 'Terapia cognitivo conductual',
    TERAPIA_DE_PAREJA: 'Terapia de pareja',
    TERAPIA_FAMILIAR: 'Terapia familiar',
    PSIQUIATRIA: 'Psiquiatría',
    NEUROPSICOLOGIA: 'Neuropsicología',
    PSICOLOGIA_INFANTIL: 'Psicología infantil',
    PSICOLOGIA_LABORAL: 'Psicología laboral',
    SEXOLOGIA: 'Sexología',
    TERAPIA_HUMANISTA: 'Terapia humanista',
  };

  getSpecialtyLabel(specialty?: string): string {
    if (!specialty) return 'Profesional';
    return this.specialtyLabels[specialty] || specialty;
  }

  ngOnInit(): void {
    this.loadDoctor();
  }

  loadDoctor(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.doctorService.getUserById(this.id).subscribe({
      next: (doc) => {
        this.doctor.set(doc);
        if (doc) {
          const specialty = this.getSpecialtyLabel(doc.specialty);
          this.titleService.setTitle(`Dr/a. ${doc.firstName} ${doc.lastName} (${specialty}) | Therapify`);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar doctor', err);
        this.loadError.set('No pudimos cargar la información del profesional.');
        this.isLoading.set(false);
      },
    });
  }

  goBack(event?: Event): void {
    if (event) event.preventDefault();
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/doctors']);
    }
  }

  getDayLabel(day: string): string {
    return this.DAY_LABELS[day as keyof typeof this.DAY_LABELS] || day;
  }

  getInitials(firstName?: string, lastName?: string): string {
    const fn = (firstName || '').trim().charAt(0);
    const ln = (lastName || '').trim().charAt(0);
    return `${fn}${ln}`.toUpperCase() || 'P';
  }

  formatHours(hours: string[]): string {
    return this.formatScheduleRange(hours);
  }

  formatScheduleRange(hours: string[]): string {
    if (!hours || !hours.length) return '';
    if (hours.length === 1) return `${hours[0]} hs`;
    if (hours.length <= 3) {
      return hours.join(' · ') + ' hs';
    }
    const sorted = [...hours].sort();
    return `${sorted[0]} a ${sorted[sorted.length - 1]} hs`;
  }
}
