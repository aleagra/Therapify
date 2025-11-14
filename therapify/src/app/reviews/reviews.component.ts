import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';
import { Reviews } from '../../types/reviews';

@Component({
  selector: 'app-reviews',
  imports: [ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'], // <-- Corregido
})
export class ReviewsComponent implements OnInit {
  @Input() doctorId!: string;

  reviews: Reviews[] = [];

  // --- Propiedades para Edición ---
  isEditing: boolean = false;
  reviewToEditId: string | null = null;

  // --- Inyección de Dependencias ---
  fb = inject(FormBuilder);
  userService = inject(UserService);
  reviewsService = inject(ReviewsService);

  // --- Datos del Usuario ---
  userLogged = this.userService.getLoggedUser();

  // --- Formulario de Reseña ---
  reviewForm: FormGroup = this.fb.group({
    comment: [null, [Validators.required, Validators.minLength(8)]],
    value: [1, Validators.required],
  });

  ngOnInit(): void {
    if (this.doctorId) {
      this.loadReviews();
    }
  }

  loadReviews(): void {
    this.reviewsService.getReviewsByDoctor(this.doctorId).subscribe((data) => {
      this.reviews = data;
    });
  }

  onSubmitReview(): void {
    if (!this.userLogged) {
      alert('Debes iniciar sesión para dejar una reseña.');
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const now = new Date().toISOString();

    if (this.isEditing && this.reviewToEditId) {
      // --- Edición ---
      const updatedData: Reviews = {
        id: this.reviewToEditId,
        date: now, // actualizamos timestamp
        patientId: this.userLogged.id,
        drId: this.doctorId,
        value: this.reviewForm.value.value,
        comment: this.reviewForm.value.comment,
      };

      this.reviewsService
        .updateReview(this.reviewToEditId, updatedData)
        .subscribe((updatedReview) => {
          if (!updatedReview) {
            alert('Error al actualizar la reseña.');
            return;
          }

          const index = this.reviews.findIndex(
            (r) => r.id === updatedReview.id
          );
          if (index !== -1) this.reviews[index] = updatedReview;
          this.resetForm();
        });
    } else {
      // --- Creación ---
      const reviewData: Reviews = {
        id: 'temp-' + Date.now(), // id temporal único
        date: now,
        patientId: this.userLogged.id,
        drId: this.doctorId,
        value: this.reviewForm.value.value,
        comment: this.reviewForm.value.comment,
      };

      this.reviewsService.createReview(reviewData).subscribe((newReview) => {
        if (!newReview) {
          alert('Error al crear la reseña.');
          return;
        }

        // Reemplaza temporal por id real del backend
        const index = this.reviews.findIndex((r) => r.id === reviewData.id);
        if (index !== -1) this.reviews[index] = newReview;
        else this.reviews.push(newReview);

        this.resetForm();
      });
    }
  }

  deleteReview(reviewId: string): void {
    if (!this.userLogged) {
      alert('Debes iniciar sesión para eliminar una reseña.');
      return;
    }

    const reviewToDelete = this.reviews.find((r) => r.id === reviewId);
    if (!reviewToDelete) return;

    if (reviewToDelete.patientId !== this.userLogged.id) {
      alert('Error: No puedes borrar reseñas de otros usuarios.');
      return;
    }

    this.reviewsService.deleteReview(reviewId).subscribe(() => {
      this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    });
  }

  selectReviewToEdit(review: Reviews): void {
    if (!this.userLogged) {
      alert('Debes iniciar sesión para editar una reseña.');
      return;
    }

    if (review.patientId !== this.userLogged.id) {
      alert('Error: No puedes editar reseñas de otros usuarios.');
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
    this.reviewForm.reset();
    this.reviewForm.controls['value'].setValue(1);
    this.isEditing = false;
    this.reviewToEditId = null;
  }
}
