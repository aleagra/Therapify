import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';
import { Reviews } from '../../types/reviews';

@Component({
  selector: 'app-reviews',
  imports: [ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent   {
  @Input() doctorId!: string;

  reviews: Reviews[] = []; // <-- Usamos el tipo 'Review'

  // --- Propiedades para Edición ---
  isEditing: boolean = false;
  reviewToEditId: string | null = null;

  // --- Inyección de Dependencias ---
  fb = inject(FormBuilder);
  userService = inject(UserService);
  reviewsService = inject(ReviewsService);

  // --- Datos del Usuario ---
  // Asumimos que getLoggedUser() devuelve un objeto con { id: string, ... }
  userLogged = this.userService.getLoggedUser(); 

  // --- Formulario de Reseña ---
  reviewForm: FormGroup = this.fb.group({
    // 7. Nombres de control deben coincidir con la lógica
    comment: [null, [Validators.required, Validators.minLength(8)]],
    value: [1, Validators.required] // Renombrado de 'valoration' a 'value'
  });

  // --- 8. ngOnInit se ejecuta cuando el componente se inicia ---
  ngOnInit(): void {
    // Solo cargamos reseñas si el doctorId (Input) ha sido recibido
    if (this.doctorId) {
      this.loadReviews();
    }
  }

  loadReviews(): void {
    this.reviewsService.getReviewsByDoctor(this.doctorId)
      .subscribe(data => {
        this.reviews = data;
      });
  }

  // --- 9. Método de Envío (Combinado: Alta y Modificación) ---
  onSubmitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    // Si estamos editando, llamamos a la lógica de Modificación
    if (this.isEditing && this.reviewToEditId) {
      const updatedData: Reviews = {
        id: this.reviewToEditId,
        patientId: this.userLogged.id, // ID del usuario logueado
        drId: this.doctorId,
        value: this.reviewForm.value.value,
        comment: this.reviewForm.value.comment
      };
      
      this.reviewsService.updateReview(this.reviewToEditId, updatedData).subscribe(updatedReview => {
       
        const index = this.reviews.find(r => r.id === updatedReview.id);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }
        this.resetForm();
      });

    } else {
      // --- Lógica de Creación (Alta) ---
      const reviewData: Reviews = {
        patientId: this.userLogged.id, // Usamos el id del usuario logueado q no esta
        drId: this.doctorId,
        value: this.reviewForm.value.value, 
        comment: this.reviewForm.value.comment 
      };

      this.reviewsService.createReview(reviewData).subscribe(newReview => {
        this.reviews.push(newReview);
        this.resetForm();
      });
    }
  }


  deleteReview(reviewId: string): void {
  
    const reviewToDelete = this.reviews.find(r => r.id === reviewId);

   
    if (reviewToDelete?.patientId !== this.userLogged.id) {
      alert("Error: No puedes borrar reseñas de otros usuarios.");
      return;
    }


    this.reviewsService.deleteReview(reviewId).subscribe(() => {
      this.reviews = this.reviews.filter(review => review.id !== reviewId);
    });
  }

  selectReviewToEdit(review: Reviews): void {
    if (review.patientId !== this.userLogged.id) {
      alert("Error: No puedes editar reseñas de otros usuarios.");
      return;
    }

    this.isEditing = true;
    this.reviewToEditId = review.id;

    this.reviewForm.patchValue({
      value: review.value,
      comment: review.comment
    });
  }


  resetForm(): void {
    this.reviewForm.reset();
    this.reviewForm.controls['value'].setValue(1); // Resetea las estrellas a 1
    this.isEditing = false;
    this.reviewToEditId = null;
  }


}
