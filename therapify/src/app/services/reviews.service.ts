import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Reviews } from '../../types/reviews';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  
  http= inject(HttpClient)
  apiUrl='http://localhost:3000/reviews';


   createReview(ap: Omit<Reviews, 'id'>) {
      return this.http.post<Reviews>(this.apiUrl, ap).pipe(
        catchError((err) => {
          console.error('Error al crear la review:', err);
          return of(null);
        })
      );
    }
  
    // Obtener todos las resenas
    getReviewsforSpecialist(): Observable<Reviews[]> {
      return this.http.get<Reviews[]>(this.apiUrl).pipe(
        catchError((err) => {
          console.error('Error al obtener reviews:', err);
          return of([]);
        })
      );
    }
  
    // Obtener las reviews por ID de cliente
    getReviewsforClients(id: string): Observable<Reviews | null> {
      return this.http.get<Reviews>(`${this.apiUrl}/${id}`).pipe(
        catchError((err) => {
          console.error('Error al obtener las reviews del usuario:', err);
          return of(null);
        })
      );
    }

    getReviewsByDoctor(doctorId: string): Observable<Reviews[]> {
        return this.http
          .get<Reviews[]>(`${this.apiUrl}?doctorId=${doctorId}`)
          .pipe(
            catchError((err) => {
              console.error('Error al obtener reviews del doctor:', err);
              return of([]);
            })
          );
      }


    updateReview(reviewId: string, reviewData: Reviews): Observable<Reviews> {
    // Esto se traduce a: PUT /reseñas/1
    return this.http.put<Reviews>(`${this.apiUrl}/${reviewId}`, reviewData);
  }


  deleteReview(reviewId: string): Observable<{}> {
 
    return this.http.delete<{}>(`${this.apiUrl}/${reviewId}`);
  }


}
