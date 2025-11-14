import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Reviews } from '../../types/reviews';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  http = inject(HttpClient);
  apiUrl = 'http://localhost:3000/reviews';

  // Crear review
  createReview(review: Omit<Reviews, 'id'>): Observable<Reviews | null> {
    // JSON Server genera el id automáticamente si no se lo enviamos
    return this.http.post<Reviews>(this.apiUrl, review).pipe(
      catchError((err) => {
        console.error('Error al crear la review:', err);
        return of(null);
      })
    );
  }

  // Obtener todas las reviews
  getReviewsforSpecialist(): Observable<Reviews[]> {
    return this.http.get<Reviews[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error al obtener reviews:', err);
        return of([]);
      })
    );
  }

  // Obtener reviews por ID de cliente
  getReviewsforClients(id: string): Observable<Reviews | null> {
    return this.http.get<Reviews>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al obtener las reviews del usuario:', err);
        return of(null);
      })
    );
  }

  // Obtener reviews por doctor (drId)
  getReviewsByDoctor(drId: string): Observable<Reviews[]> {
    return this.http.get<Reviews[]>(`${this.apiUrl}?drId=${drId}`).pipe(
      catchError((err) => {
        console.error('Error al obtener reviews del doctor:', err);
        return of([]);
      })
    );
  }

  // Actualizar review
  updateReview(reviewId: string, reviewData: Reviews): Observable<Reviews> {
    return this.http.put<Reviews>(`${this.apiUrl}/${reviewId}`, reviewData);
  }

  // Borrar review
  deleteReview(reviewId: string): Observable<{}> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }
}
