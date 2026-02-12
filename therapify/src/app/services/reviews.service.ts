import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Reviews } from '../../types/reviews';
import { catchError, Observable, of } from 'rxjs';
import { ReviewRequestDTO } from '../../types/ReviewRequestDTO';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);

  private BASE_URL = 'http://localhost:8080';
  private REVIEWS_URL = `${this.BASE_URL}/reviews`;

  private localKey = 'userLogged';

  // ================================
  // Helpers JWT (igual que UserService)
  // ================================
  private getLoggedUser() {
    const data = localStorage.getItem(this.localKey);
    return data ? JSON.parse(data) : null;
  }

  private getToken(): string | null {
    const user = this.getLoggedUser();
    return user?.token ?? null;
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    return {
      headers: token
        ? new HttpHeaders({ Authorization: `Bearer ${token}` })
        : new HttpHeaders(),
    };
  }

  // ================================
  // CREATE (requiere login)
  // ================================
  createReview(review: ReviewRequestDTO): Observable<Reviews> {
    return this.http.post<Reviews>(
      this.REVIEWS_URL,
      review,
      this.getAuthHeaders(),
    );
  }

  // ================================
  // GET PUBLICOS
  // ================================
  getReviewsForUser(userId: string): Observable<Reviews[]> {
    return this.http
      .get<
        Reviews[]
      >(`${this.REVIEWS_URL}/user/${userId}`, this.getAuthHeaders())
      .pipe(
        catchError((err) => {
          console.error('Error al obtener reviews del usuario:', err);
          return of([]);
        }),
      );
  }

  getReviewsByDoctor(drId: string): Observable<Reviews[]> {
    return this.http.get<Reviews[]>(`${this.REVIEWS_URL}/doctor/${drId}`);
  }

  getReviewsForClient(id: string): Observable<Reviews | null> {
    return this.http.get<Reviews>(`${this.REVIEWS_URL}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al obtener las reviews del usuario:', err);
        return of(null);
      }),
    );
  }

  // ================================
  // UPDATE (requiere login)
  // ================================
  updateReview(
    reviewId: string,
    reviewData: ReviewRequestDTO,
  ): Observable<Reviews> {
    return this.http.put<Reviews>(
      `${this.REVIEWS_URL}/${reviewId}`,
      reviewData,
      this.getAuthHeaders(),
    );
  }
  // ================================
  // DELETE (requiere login)
  // ================================
  deleteReview(reviewId: string): Observable<boolean> {
    return this.http
      .delete<boolean>(`${this.REVIEWS_URL}/${reviewId}`, this.getAuthHeaders())
      .pipe(
        catchError((err) => {
          console.error('Error al eliminar review:', err);
          return of(false);
        }),
      );
  }
}
