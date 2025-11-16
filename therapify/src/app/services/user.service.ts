import { inject, Injectable, signal } from '@angular/core';
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

  isLoggedSignal = signal(!!localStorage.getItem(this.localKey));

  postUser(user: Omit<User, 'id'>): Observable<User> {
    if (user.userType === 'doctor') {
      user.schedule = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      };

      const hours: string[] = [];
      for (let h = 8; h <= 17; h++) {
        hours.push(h.toString().padStart(2, '0') + ':00');
      }

      user.availability = {
        monday: [...hours],
        tuesday: [...hours],
        wednesday: [...hours],
        thursday: [...hours],
        friday: [...hours],
      };
    }

    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError((err) => {
        console.error('Error al crear el usuario:', err);
        return of({ ...user, id: '0' } as User);
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

  getUserById(id: string): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al obtener usuario por ID:', err);
        return of(null);
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
          this.isLoggedSignal.set(true);
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
    this.isLoggedSignal.set(false);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.localKey) !== null;
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user).pipe(
      map((updatedUser) => {
        this.updateLocalUser(updatedUser);
        return updatedUser;
      }),
      catchError((err) => {
        console.error('Error al actualizar usuario:', err);
        return of(user);
      })
    );
  }

  updateLocalUser(user: User): void {
    localStorage.setItem(this.localKey, JSON.stringify(user));
    console.log('Usuario actualizado en localStorage:', user);
  }

  getDoctores(): Observable<any[]> {
    return this.http
      .get<any[]>(this.apiUrl)
      .pipe(map((users) => users.filter((user) => user.userType === 'doctor')));
  }
  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
