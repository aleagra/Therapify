import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { User } from '../../types/user';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private BASE_URL = API_CONFIG.baseUrl;
  private USERS_URL = `${this.BASE_URL}/usuarios`;
  private AUTH_URL = `${this.BASE_URL}/auth`;

  localKey = 'userLogged';
  isLoggedSignal = signal(!!localStorage.getItem(this.localKey));
  isDemoSignal = signal(this.checkIsDemoUser(this.getLoggedUser()));

  private checkIsDemoUser(user: User | null): boolean {
    if (!user) return false;
    return (
      user.isDemo === true ||
      user.email === 'demo.terapeuta@therapify.com' ||
      user.email === 'demo.paciente@therapify.com'
    );
  }

  private doctoresCache$: Observable<User[]> | null = null;
  private usersCache$: Observable<User[]> | null = null;
  private userByIdCache = new Map<string, Observable<User | null>>();

  private invalidateUserCaches(id?: string): void {
    this.doctoresCache$ = null;
    this.usersCache$ = null;
    if (id) {
      this.userByIdCache.delete(id);
    } else {
      this.userByIdCache.clear();
    }
  }

  public getLoggedUser(): User | null {
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

  postUser(user: Omit<User, 'id'>): Observable<User> {
    if (user.userType === 'DOCTOR') {
      user.schedule = undefined as any;
      user.availability = undefined as any;
    }

    return this.http.post<User>(this.USERS_URL, user).pipe(
      tap(() => this.invalidateUserCaches()),
      catchError((err) => {
        console.error('Error al crear usuario', err);
        return throwError(() => err);
      }),
    );
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http
      .post<User>(`${this.AUTH_URL}/login`, { email, password })
      .pipe(
        tap((user) => {
          if (user?.token) {
            const isDemo =
              email === 'demo.terapeuta@therapify.com' ||
              email === 'demo.paciente@therapify.com' ||
              user.isDemo === true;
            const userWithDemo: User = { ...user, isDemo };
            localStorage.setItem(this.localKey, JSON.stringify(userWithDemo));
            this.isLoggedSignal.set(true);
            this.isDemoSignal.set(isDemo);
            this.invalidateUserCaches();
          }
        }),
        // Propagamos en vez de devolver null: el backend distingue credenciales
        // invalidas de cuenta sin verificar (ambas 403), y colapsarlas en un
        // unico "contrasena incorrecta" manda al usuario a buscar el problema
        // donde no esta.
        catchError((err) => {
          console.error('Error al iniciar sesión', err);
          return throwError(() => err);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.localKey);
    this.isLoggedSignal.set(false);
    this.isDemoSignal.set(false);
    this.invalidateUserCaches();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserById(id: string): Observable<User | null> {
    if (!this.userByIdCache.has(id)) {
      const user$ = this.http
        .get<User>(`${this.USERS_URL}/${id}`, this.getAuthHeaders())
        .pipe(
          catchError(() => {
            this.userByIdCache.delete(id);
            return of(null);
          }),
          shareReplay(1),
        );
      this.userByIdCache.set(id, user$);
    }
    return this.userByIdCache.get(id)!;
  }

  /** Calienta la cache de un doctor antes de navegar (p. ej. al pasar el mouse sobre su tarjeta). */
  prefetchUserById(id: string): void {
    this.getUserById(id).subscribe();
  }

  updateUser(dto: Partial<User>): Observable<User> {
    return this.http
      .put<{
        mensaje: string;
        user: User;
        token: string;
      }>(`${this.USERS_URL}`, dto, this.getAuthHeaders())
      .pipe(
        map((res) => {
          const updatedUser: User = {
            ...res.user,
            token: res.token,
          };

          localStorage.setItem(this.localKey, JSON.stringify(updatedUser));

          return updatedUser;
        }),
        tap((updatedUser) => this.invalidateUserCaches(updatedUser.id)),
        catchError((err) => {
          console.error('Error al actualizar usuario', err);
          return throwError(() => err);
        }),
      );
  }

  updateLocalUser(user: User): void {
    const current = this.getLoggedUser();
    localStorage.setItem(
      this.localKey,
      JSON.stringify({ ...user, token: current?.token }),
    );
  }

  getDoctores(): Observable<User[]> {
    if (!this.doctoresCache$) {
      this.doctoresCache$ = this.http
        .get<User[]>(`${this.USERS_URL}/rol/DOCTOR`)
        .pipe(
          catchError((err) => {
            console.error('Error al obtener doctores', err);
            this.doctoresCache$ = null;
            return of([]);
          }),
          shareReplay(1),
        );
    }
    return this.doctoresCache$;
  }

  getUsers(): Observable<User[]> {
    if (!this.usersCache$) {
      this.usersCache$ = this.http
        .get<User[]>(this.USERS_URL, this.getAuthHeaders())
        .pipe(
          catchError((err) => {
            console.error('Error al obtener usuarios', err);
            this.usersCache$ = null;
            return of([]);
          }),
          shareReplay(1),
        );
    }
    return this.usersCache$;
  }

  deleteUser(id: string) {
    return this.http
      .delete(`${this.USERS_URL}/${id}`, this.getAuthHeaders())
      .pipe(tap(() => this.invalidateUserCaches(id)));
  }
  deleteUserCascade(id: string) {
    return this.http
      .delete(`${this.USERS_URL}/${id}/cascade`, this.getAuthHeaders())
      .pipe(tap(() => this.invalidateUserCaches(id)));
  }

  getDoctorsNear(lat: number, lng: number) {
    return this.http.get<User[]>(
      `${this.USERS_URL}/doctors/near?lat=${lat}&lng=${lng}`,
    );
  }
}
