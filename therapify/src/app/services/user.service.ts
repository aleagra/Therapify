import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../../types/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  apiUrl = 'http://localhost:3000/users';
  localKey = 'userLogged';

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

  login(email: string, password: string): Observable<User | null> {
    const url = `${this.apiUrl}?email=${email}&password=${password}`;
    return this.http.get<User[]>(url).pipe(
      map((users) => {
        if (users.length > 0) {
          const user = users[0];
          console.log('Usuario logueado:', user);
          localStorage.setItem(this.localKey, JSON.stringify(user));
          return user;
        } else {
          console.warn('Credenciales inválidas');
          return null;
        }
      }),
      catchError((err) => {
        console.error('Error al intentar iniciar sesión:', err);
        return of(null);
      })
    );
  }

  getLoggedUser(): User | null {
    const data = localStorage.getItem(this.localKey);
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem(this.localKey);
    console.log('Sesión cerrada');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.localKey) !== null;
  }
}
