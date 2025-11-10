import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../types/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  apiUrl = 'http://localhost:3000/users';

  postUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError((err) => {
        console.error('Error al crear el usuario:', err);
        return of({ ...user, id: 0 });
      })
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error al obtener usuarios:', err);
        return of([]);
      })
    );
  }
}
