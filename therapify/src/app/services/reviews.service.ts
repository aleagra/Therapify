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

  createReview(review: Omit<Reviews, 'id'>): Observable<Reviews | null> {
    return this.http.post<Reviews>(this.apiUrl, review).pipe(
      catchError((err) => {
        console.error('Error al crear la review:', err);
        return of(null);
      })
    );
  }

  getReviewsforSpecialist(): Observable<Reviews[]> {
    return this.http.get<Reviews[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error al obtener reviews:', err);
        return of([]);
      })
    );
  }

  getReviewsforClients(id: string): Observable<Reviews | null> {
    return this.http.get<Reviews>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al obtener las reviews del usuario:', err);
        return of(null);
      })
    );
  }

  getReviewsByDoctor(drId: string): Observable<Reviews[]> {
    return this.http.get<Reviews[]>(`${this.apiUrl}?drId=${drId}`).pipe(
      catchError((err) => {
        console.error('Error al obtener reviews del doctor:', err);
        return of([]);
      })
    );
  }

  updateReview(reviewId: string, reviewData: Reviews): Observable<Reviews> {
    return this.http.put<Reviews>(`${this.apiUrl}/${reviewId}`, reviewData);
  }

  deleteReview(reviewId: string): Observable<{}> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }
}
