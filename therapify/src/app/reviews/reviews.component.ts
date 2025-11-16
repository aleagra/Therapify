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

@Component({
  selector: 'app-reviews',
  imports: [ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  @Input() doctorId!: string;
  reviews: Reviews[] = [];
  users: User[] = [];

  isEditing = false;
  reviewToEditId: string | null = null;

  fb = inject(FormBuilder);
  userService = inject(UserService);
  reviewsService = inject(ReviewsService);
  route = inject(ActivatedRoute);
  userLogged = this.userService.getLoggedUser();

  reviewForm: FormGroup = this.fb.group({
    comment: [null, [Validators.required, Validators.minLength(8)]],
    value: [1, Validators.required],
  });

  ngOnInit(): void {
    if (!this.doctorId) {
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      if (!idFromRoute) {
        alert('No se encontró el ID del doctor.');
        return;
      }
      this.doctorId = idFromRoute;
    }
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
    });

    this.loadReviews();
  }

  loadReviews(): void {
    if (!this.doctorId) return;
    this.reviewsService.getReviewsByDoctor(this.doctorId).subscribe((data) => {
      this.reviews = data;
    });
  }

  getUserName(patientId: string): string {
    const user = this.users.find((u) => u.id === patientId);
    return user ? `${user.firstName} ${user.lastName}` : 'Usuario desconocido';
  }

  onSubmitReview(): void {
    if (!this.userLogged) {
      alert('Debes iniciar sesión para dejar una reseña.');
      return;
    }

    if (!this.doctorId) {
      alert('No se puede crear la reseña: doctorId no definido.');
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const reviewData: Omit<Reviews, 'id'> = {
      patientId: this.userLogged.id,
      drId: this.doctorId,
      value: this.reviewForm.value.value,
      comment: this.reviewForm.value.comment,
      date: new Date().toISOString(),
    };

    if (this.isEditing && this.reviewToEditId) {
      const updatedData: Reviews = { ...reviewData, id: this.reviewToEditId };
      this.reviewsService
        .updateReview(this.reviewToEditId, updatedData)
        .subscribe((updatedReview) => {
          if (!updatedReview) return alert('Error al actualizar la reseña.');
          const index = this.reviews.findIndex(
            (r) => r.id === updatedReview.id
          );
          if (index !== -1) this.reviews[index] = updatedReview;
          this.resetForm();
        });
    } else {
      this.reviewsService.createReview(reviewData).subscribe((newReview) => {
        if (!newReview) return alert('Error al crear la reseña.');
        this.reviews.push(newReview);
        this.resetForm();
      });
    }
  }

  deleteReview(reviewId: string): void {
    if (!this.userLogged)
      return alert('Debes iniciar sesión para eliminar una reseña.');
    const reviewToDelete = this.reviews.find((r) => r.id === reviewId);
    if (!reviewToDelete) return;
    if (reviewToDelete.patientId !== this.userLogged.id)
      return alert('No puedes borrar reseñas de otros usuarios.');

    this.reviewsService.deleteReview(reviewId).subscribe(() => {
      this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    });
  }

  selectReviewToEdit(review: Reviews): void {
    if (!this.userLogged)
      return alert('Debes iniciar sesión para editar una reseña.');
    if (review.patientId !== this.userLogged.id)
      return alert('No puedes editar reseñas de otros usuarios.');

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
