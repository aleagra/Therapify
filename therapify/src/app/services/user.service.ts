import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../../types/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private BASE_URL = 'http://localhost:8080';
  private USERS_URL = `${this.BASE_URL}/usuarios`;
  private AUTH_URL = `${this.BASE_URL}/auth`;

  localKey = 'userLogged';
  isLoggedSignal = signal(!!localStorage.getItem(this.localKey));

  // ================================
  // Helpers JWT
  // ================================
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

  // ================================
  // REGISTRO
  // ================================
  postUser(user: Omit<User, 'id'>): Observable<User> {
    if (user.userType === 'DOCTOR') {
      user.schedule = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      };
      const hours: string[] = [];
      for (let h = 8; h <= 17; h++)
        hours.push(`${h.toString().padStart(2, '0')}:00`);
      user.availability = {
        monday: hours,
        tuesday: hours,
        wednesday: hours,
        thursday: hours,
        friday: hours,
      };
    }

    return this.http
      .post<User>(this.USERS_URL, user, {
        headers: new HttpHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('Error al crear usuario', err);
          return of({ ...user, id: '0' } as User);
        }),
      );
  }
  // ================================
  // LOGIN
  // ================================
  login(email: string, password: string): Observable<User | null> {
    return this.http
      .post<User>(`${this.AUTH_URL}/login`, { email, password })
      .pipe(
        tap((user) => {
          if (user?.token) {
            localStorage.setItem(this.localKey, JSON.stringify(user));
            this.isLoggedSignal.set(true);
          }
        }),
        catchError((err) => {
          console.error('Credenciales inválidas', err);
          return of(null);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.localKey);
    this.isLoggedSignal.set(false);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ================================
  // PERFIL USUARIO
  // ================================
  getUserById(id: string): Observable<User | null> {
    return this.http
      .get<User>(`${this.USERS_URL}/${id}`, this.getAuthHeaders())
      .pipe(catchError(() => of(null)));
  }

  updateUser(dto: Partial<User>): Observable<User> {
    const payload: any = { ...dto };

    // Convertimos a JSON solo si existen
    if (dto.schedule) payload.schedule = JSON.stringify(dto.schedule);
    if (dto.availability)
      payload.availability = JSON.stringify(dto.availability);

    // Tipamos la respuesta según lo que devuelve el backend
    return this.http
      .put<{
        mensaje: string;
        token: string;
      }>(`${this.USERS_URL}`, payload, this.getAuthHeaders())
      .pipe(
        tap((res) => {
          // Obtenemos el usuario actual del localStorage
          const current = this.getLoggedUser();
          if (current) {
            // Fusionamos el token recibido con los datos actuales
            const updatedUser: User = { ...current, token: res.token };
            localStorage.setItem(this.localKey, JSON.stringify(updatedUser));
          }
        }),
        // Para que TypeScript no se queje, devolvemos el usuario actualizado
        // en lugar del objeto {mensaje, token}
        // Esto mantiene la firma Observable<User>
        catchError((err) => {
          console.error('Error al actualizar usuario', err);
          const local = this.getLoggedUser();
          return of(local!) as Observable<User>;
        }),
        // map para devolver el usuario actualizado
        // en vez de {mensaje, token}
        tap(() => {}), // opcional si no queremos mapear
      ) as unknown as Observable<User>;
  }

  updateLocalUser(user: User): void {
    const current = this.getLoggedUser();
    localStorage.setItem(
      this.localKey,
      JSON.stringify({ ...user, token: current?.token }),
    );
  }

  // ================================
  // DOCTORES (Público)
  // ================================
  getDoctores(): Observable<User[]> {
    return this.http.get<User[]>(`${this.USERS_URL}/rol/DOCTOR`).pipe(
      catchError((err) => {
        console.error('Error al obtener doctores', err);
        return of([]);
      }),
    );
  }

  // ================================
  // ADMIN
  // ================================
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.USERS_URL, this.getAuthHeaders()).pipe(
      catchError((err) => {
        console.error('Error al obtener usuarios', err);
        return of([]);
      }),
    );
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.USERS_URL}/${id}`, this.getAuthHeaders());
  }
}
