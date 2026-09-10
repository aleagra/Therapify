import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, computed } from '@angular/core';
import { Location, DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';
import { AppointmentService } from '../services/appointments.service';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { InitialsPipe } from '../pipes/initials.pipe';
import { Reviews } from '../../types/reviews';
import { User } from '../../types/user';
import { toast } from 'ngx-sonner';
import { ReviewRequestDTO } from '../../types/ReviewRequestDTO';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [ReactiveFormsModule, SkeletonComponent, DatePipe, InitialsPipe],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsComponent implements OnInit {
  @Input() doctorId!: string;

  reviews = signal<Reviews[]>([]);
  isEditing = signal(false);
  reviewToEditId = signal<string | null>(null);
  isLoadingReviews = signal(true);
  loadError = signal<string | null>(null);

  readonly reviewsPageSize = 8;
  visibleReviewsCount = signal(this.reviewsPageSize);

  private skeletonShownTime: number | null = null;

  private readonly skeletonState = toSignal(
    toObservable(this.isLoadingReviews).pipe(
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

  readonly skeletonCards = [1, 2, 3, 4];

  fb = inject(FormBuilder);
  userService = inject(UserService);
  reviewsService = inject(ReviewsService);
  appointmentService = inject(AppointmentService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);

  userLogged: User | null = this.userService.getLoggedUser();

  /** null = todavía no se sabe (o no aplica); true/false una vez resuelto el check. */
  hasAppointmentWithDoctor = signal<boolean | null>(null);

  get canSubmitReview(): boolean {
    if (this.isEditing()) return true;
    if (!this.userLogged) return true;
    return this.hasAppointmentWithDoctor() !== false;
  }

  goBack(event?: Event): void {
    if (event) event.preventDefault();
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/doctors']);
    }
  }

  reviewForm: FormGroup = this.fb.group({
    comment: [''],
    value: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  hoverRating = signal(0);

  setHover(val: number): void {
    this.hoverRating.set(val);
  }

  setRating(val: number): void {
    this.reviewForm.get('value')?.setValue(val);
  }

  onStarKey(event: KeyboardEvent, star: number): void {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.min(5, star + 1);
      this.setRating(next);
      this.setHover(0);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      const prev = Math.max(1, star - 1);
      this.setRating(prev);
      this.setHover(0);
    }
  }

  get commentLength(): number {
    return this.reviewForm.get('comment')?.value?.length || 0;
  }

  averageRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return 0;
    const sum = list.reduce((acc, r) => acc + r.value, 0);
    return Number((sum / list.length).toFixed(1));
  });

  starCounts = computed(() => {
    const list = this.reviews();
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of list) {
      if (counts[r.value] !== undefined) {
        counts[r.value]++;
      }
    }
    return counts;
  });

  starPercentages = computed(() => {
    const list = this.reviews();
    const total = list.length;
    const percentages: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (!total) return percentages;
    const counts = this.starCounts();
    for (let s = 1; s <= 5; s++) {
      percentages[s] = Math.round((counts[s] / total) * 100);
    }
    return percentages;
  });

  visibleReviews = computed(() => {
    return this.reviews().slice(0, this.visibleReviewsCount());
  });

  remainingReviewsCount = computed(() => {
    return Math.max(0, this.reviews().length - this.visibleReviewsCount());
  });

  showMoreReviews(): void {
    this.visibleReviewsCount.update((c) => c + this.reviewsPageSize);
  }

  ngOnInit(): void {
    if (!this.doctorId) {
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      if (!idFromRoute) {
        toast.error('No se encontró el ID del doctor.');
        return;
      }
      this.doctorId = idFromRoute;
    }

    this.loadReviews();
    this.checkAppointmentEligibility();
  }

  private checkAppointmentEligibility(): void {
    if (!this.userLogged) return;

    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        const appointments =
          response?.content ?? (Array.isArray(response) ? response : []);
        const hadAppointment = appointments.some(
          (a) => String(a.doctorId) === String(this.doctorId),
        );
        this.hasAppointmentWithDoctor.set(hadAppointment);
      },
      error: () => {
        // Si no se puede verificar, no bloqueamos: el backend valida igual al enviar.
        this.hasAppointmentWithDoctor.set(true);
      },
    });
  }

  loadReviews(): void {
    this.isLoadingReviews.set(true);
    this.loadError.set(null);
    this.reviewsService.getReviewsByDoctor(this.doctorId).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.visibleReviewsCount.set(this.reviewsPageSize);
        this.isLoadingReviews.set(false);
      },
      error: (err) => {
        console.error('Error al cargar reseñas', err);
        this.loadError.set('No pudimos cargar las reseñas. Por favor, revisá tu conexión e intentá nuevamente.');
        this.isLoadingReviews.set(false);
      },
    });
  }

  onSubmitReview(): void {
    if (!this.userLogged) {
      toast.warning('Debes iniciar sesión.');
      return;
    }

    if (!this.canSubmitReview) {
      toast.error('Solo podés dejar reseñas a doctores con los que tuviste un turno.');
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const rawComment = this.reviewForm.value.comment;
    const commentVal = typeof rawComment === 'string' ? rawComment.trim() : '';

    const reviewData: ReviewRequestDTO = {
      doctorId: Number(this.doctorId),
      value: Number(this.reviewForm.value.value),
      comment: commentVal || undefined,
    };

    if (this.isEditing() && this.reviewToEditId()) {
      const editId = this.reviewToEditId()!;
      this.reviewsService
        .updateReview(editId, reviewData)
        .subscribe({
          next: (review) => {
            this.reviews.update((list) =>
              list.map((r) => (r.id === review.id ? review : r)),
            );
            toast.success('Reseña actualizada ✅', { position: 'top-center' });
            this.resetForm();
          },
          error: () =>
            toast.error('No se pudo actualizar la reseña', {
              position: 'top-center',
            }),
        });
      return;
    }

    this.reviewsService.createReview(reviewData).subscribe({
      next: (review) => {
        this.reviews.update((list) => [review, ...list]);
        this.visibleReviewsCount.update((c) => c + 1);
        toast.success('Reseña creada ✅', { position: 'top-center' });
        this.resetForm();
      },
      error: (err) =>
        toast.error(
          err?.error?.message ||
            'No podés dejar una reseña si no tuviste turno con este doctor.',
          { position: 'top-center' },
        ),
    });
  }

  deleteReview(id: string): void {
    if (!this.userLogged) {
      toast.warning('Debes iniciar sesión');
      return;
    }

    const review = this.reviews().find((r) => r.id === id);
    if (!review) return;

    const isOwner = review.patientId === this.userLogged.id;
    const isAdmin = this.userLogged.userType === 'ADMIN';

    if (!isOwner && !isAdmin) {
      toast.error('No tenés permiso para borrar esta reseña');
      return;
    }

    toast('¿Seguro que querés eliminar esta reseña?', {
      position: 'top-center',
      action: {
        label: 'Eliminar',
        onClick: () => this.executeDeleteReview(id),
      },
      cancel: { label: 'Cancelar' },
    });
  }

  private executeDeleteReview(id: string): void {
    this.reviewsService.deleteReview(id).subscribe({
      next: () => {
        this.reviews.update((list) => list.filter((r) => r.id !== id));
        toast.success('Reseña eliminada', { position: 'top-center' });
      },
      error: () =>
        toast.error('Error al eliminar la reseña', {
          position: 'top-center',
        }),
    });
  }

  selectReviewToEdit(review: Reviews): void {
    if (!this.userLogged) {
      toast.warning('Debes iniciar sesión');
      return;
    }

    if (review.patientId !== this.userLogged.id) {
      toast.error('Solo podés editar tus reseñas');
      return;
    }

    this.isEditing.set(true);
    this.reviewToEditId.set(review.id);

    this.reviewForm.patchValue({
      value: review.value,
      comment: review.comment,
    });
  }

  resetForm(): void {
    this.reviewForm.reset({ value: 1, comment: '' });
    this.isEditing.set(false);
    this.reviewToEditId.set(null);
  }
}
