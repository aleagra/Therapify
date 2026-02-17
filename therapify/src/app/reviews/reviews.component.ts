import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';
import { Reviews } from '../../types/reviews';
import { User } from '../../types/user';
import { toast } from 'ngx-sonner';
import { ReviewRequestDTO } from '../../types/ReviewRequestDTO';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  @Input() doctorId!: string;

  reviews: Reviews[] = [];
  isEditing = false;
  reviewToEditId: string | null = null;

  fb = inject(FormBuilder);
  userService = inject(UserService);
  reviewsService = inject(ReviewsService);
  route = inject(ActivatedRoute);

  userLogged: User | null = this.userService.getLoggedUser();

  reviewForm: FormGroup = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(8)]],
    value: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

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
  }

  loadReviews(): void {
    this.reviewsService.getReviewsByDoctor(this.doctorId).subscribe({
      next: (data) => (this.reviews = data),
      error: () => toast.error('Error al cargar reseñas'),
    });
  }

  onSubmitReview(): void {
    if (!this.userLogged) {
      toast.warning('Debes iniciar sesión.');
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const reviewData: ReviewRequestDTO = {
      doctorId: Number(this.doctorId),
      value: Number(this.reviewForm.value.value),
      comment: this.reviewForm.value.comment,
    };

    // ✏️ EDITAR
    if (this.isEditing && this.reviewToEditId) {
      this.reviewsService
        .updateReview(this.reviewToEditId, reviewData)
        .subscribe({
          next: (review) => {
            const index = this.reviews.findIndex((r) => r.id === review.id);
            if (index !== -1) this.reviews[index] = review;

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

    // ➕ CREAR
    this.reviewsService.createReview(reviewData).subscribe({
      next: (review) => {
        this.reviews.push(review);
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

  // 🗑 BORRAR CON CONFIRM TOAST
  deleteReview(id: string): void {
    if (!this.userLogged) {
      toast.warning('Debes iniciar sesión');
      return;
    }

    const review = this.reviews.find((r) => r.id === id);
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

  // 👉 eliminación real
  private executeDeleteReview(id: string): void {
    this.reviewsService.deleteReview(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== id);
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

    this.isEditing = true;
    this.reviewToEditId = review.id;

    this.reviewForm.patchValue({
      value: review.value,
      comment: review.comment,
    });
  }

  resetForm(): void {
    this.reviewForm.reset({ value: 1, comment: '' });
    this.isEditing = false;
    this.reviewToEditId = null;
  }
}
