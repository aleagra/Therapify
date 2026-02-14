import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Appointment } from '../../types/appointments';
import { User } from '../../types/user';
import { AppointmentRequest } from '../../types/AppointmentRequest';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);

  private BASE_URL = 'http://localhost:8080';
  private APPOINTMENTS_URL = `${this.BASE_URL}/appointments`;
  private localKey = 'userLogged';

  private getLoggedUser(): User | null {
    const data = localStorage.getItem(this.localKey);
    return data ? JSON.parse(data) : null;
  }

  private getToken(): string | null {
    return this.getLoggedUser()?.token ?? null;
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return {
      headers: token
        ? new HttpHeaders({ Authorization: `Bearer ${token}` })
        : new HttpHeaders(),
    };
  }

  createAppointment(ap: AppointmentRequest): Observable<Appointment | null> {
    return this.http
      .post<Appointment>(this.APPOINTMENTS_URL, ap, this.getAuthHeaders())
      .pipe(
        catchError((err) => {
          console.error('Error al crear turno:', err);
          return of(null);
        }),
      );
  }

  getAppointmentById(id: string): Observable<Appointment | null> {
    return this.http
      .get<Appointment>(`${this.APPOINTMENTS_URL}/${id}`, this.getAuthHeaders())
      .pipe(
        catchError((err) => {
          console.error('Error al obtener turno por ID:', err);
          return of(null);
        }),
      );
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.APPOINTMENTS_URL}/mine`,
      this.getAuthHeaders(),
    );
  }

  getAppointmentsByDoctorAndDate(
    doctorId: string,
    date: string,
  ): Observable<Appointment[]> {
    return this.http
      .get<
        Appointment[]
      >(`${this.APPOINTMENTS_URL}/doctor/${doctorId}?date=${date}`, this.getAuthHeaders())
      .pipe(
        catchError((err) => {
          console.error('Error al obtener turnos por doctor y fecha:', err);
          return of([]);
        }),
      );
  }

  updateAppointment(
    id: string,
    appointment: Partial<Appointment>,
  ): Observable<Appointment | null> {
    return this.http
      .patch<Appointment>(
        `${this.APPOINTMENTS_URL}/${id}`,
        appointment,
        this.getAuthHeaders(),
      )
      .pipe(
        catchError((err) => {
          console.error('Error al actualizar turno:', err);
          return of(null);
        }),
      );
  }

  deleteAppointment(id: string): Observable<boolean> {
    return this.http
      .delete(`${this.APPOINTMENTS_URL}/${id}`, this.getAuthHeaders())
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error('Error al eliminar turno:', err);
          return of(false);
        }),
      );
  }

  updateAppointmentStatus(
    id: string,
    status: string,
  ): Observable<Appointment | null> {
    return this.http
      .patch<Appointment>(
        `${this.APPOINTMENTS_URL}/${id}`,
        { status },
        this.getAuthHeaders(),
      )
      .pipe(
        catchError((err) => {
          console.error('Error al actualizar estado:', err);
          return of(null);
        }),
      );
  }
}
