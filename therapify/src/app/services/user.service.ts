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

  // Crear usuario
  postUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError((err) => {
        console.error('Error al crear el usuario:', err);
        return of({ ...user, id: '0' } as User);
      })
    );
  }

  // Obtener todos los usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error al obtener usuarios:', err);
        return of([]);
      })
    );
  }

  // Obtener un usuario por ID
  getUserById(id: string): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al obtener usuario por ID:', err);
        return of(null);
      })
    );
  }

  // Login
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

  // Obtener usuario logueado del localStorage
  getLoggedUser(): User | null {
    const data = localStorage.getItem(this.localKey);
    return data ? JSON.parse(data) : null;
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.localKey);
    console.log('Sesión cerrada');
  }

  // Verificar si hay sesión activa
  isLoggedIn(): boolean {
    return localStorage.getItem(this.localKey) !== null;
  }

  // Actualizar usuario
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

  // Actualizar datos del usuario guardado localmente
  updateLocalUser(user: User): void {
    localStorage.setItem(this.localKey, JSON.stringify(user));
    console.log('Usuario actualizado en localStorage:', user);
  }
}
