import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import {
  Appointment,
  AppointmentFilterParams,
  Page,
} from '../../types/appointments';
import { User } from '../../types/user';
import { AppointmentRequest } from '../../types/AppointmentRequest';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);

  private BASE_URL = API_CONFIG.baseUrl;
  private APPOINTMENTS_URL = `${this.BASE_URL}/appointments`;
  private localKey = 'userLogged';

  private myAppointmentsCache$ = new Map<string, Observable<Page<Appointment>>>();
  private doctorDateSlotsCache$ = new Map<string, Observable<Appointment[]>>();

  invalidateCache(): void {
    this.myAppointmentsCache$.clear();
    this.doctorDateSlotsCache$.clear();
  }

  invalidateDoctorDateSlots(doctorId: string, date: string): void {
    this.doctorDateSlotsCache$.delete(`${doctorId}:${date}`);
  }

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

  createAppointment(ap: AppointmentRequest): Observable<Appointment> {
    return this.http
      .post<Appointment>(this.APPOINTMENTS_URL, ap, this.getAuthHeaders())
      .pipe(
        tap((created) => {
          this.invalidateCache();
          const docId = created?.doctorId?.toString() || (ap as any)?.doctorId?.toString();
          const dDate = created?.date || (ap as any)?.date;
          if (docId && dDate) {
            this.invalidateDoctorDateSlots(docId, dDate);
          }
        }),
        catchError((err) => {
          console.error('Error al crear turno:', err);
          return throwError(() => err);
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

  getMyAppointments(
    params?: AppointmentFilterParams,
  ): Observable<Page<Appointment>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.filter) {
        httpParams = httpParams.set('filter', params.filter);
      }
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined) {
        httpParams = httpParams.set('size', params.size.toString());
      }
    }

    const cacheKey = httpParams.toString();
    if (!this.myAppointmentsCache$.has(cacheKey)) {
      const authHeaders = this.getAuthHeaders();
      const req$ = this.http
        .get<Page<Appointment>>(`${this.APPOINTMENTS_URL}/mine`, {
          headers: authHeaders.headers,
          params: httpParams,
        })
        .pipe(
          catchError((err) => {
            this.myAppointmentsCache$.delete(cacheKey);
            return throwError(() => err);
          }),
          shareReplay(1),
        );
      this.myAppointmentsCache$.set(cacheKey, req$);
    }

    return this.myAppointmentsCache$.get(cacheKey)!;
  }

  getAppointmentsByDoctorAndDate(
    doctorId: string,
    date: string,
    forceRefresh = false,
  ): Observable<Appointment[]> {
    const key = `${doctorId}:${date}`;
    if (forceRefresh) {
      this.doctorDateSlotsCache$.delete(key);
    }
    if (!this.doctorDateSlotsCache$.has(key)) {
      const req$ = this.http
        .get<
          Appointment[]
        >(`${this.APPOINTMENTS_URL}/doctor/${doctorId}?date=${date}`, this.getAuthHeaders())
        .pipe(
          catchError((err) => {
            console.error('Error al obtener turnos por doctor y fecha:', err);
            this.doctorDateSlotsCache$.delete(key);
            return of([]);
          }),
          shareReplay(1),
        );
      this.doctorDateSlotsCache$.set(key, req$);
    }
    return this.doctorDateSlotsCache$.get(key)!;
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
        tap(() => this.invalidateCache()),
        catchError((err) => {
          console.error('Error al actualizar turno:', err);
          return of(null);
        }),
      );
  }

  /**
   * Mueve un turno existente a otro horario del mismo profesional.
   * A diferencia de updateAppointment, propaga el error en vez de tragarlo:
   * el backend discrimina el motivo del rechazo (slot ocupado, limite de
   * reprogramaciones, ventana de 24 h) y el componente necesita distinguirlos.
   */
  rescheduleAppointment(
    id: string,
    payload: { date: string; startTime: string; endTime: string },
  ): Observable<Appointment> {
    return this.http
      .patch<Appointment>(
        `${this.APPOINTMENTS_URL}/${id}/reschedule`,
        payload,
        this.getAuthHeaders(),
      )
      .pipe(
        tap((updated) => {
          this.invalidateCache();
          if (updated?.doctorId) {
            this.invalidateDoctorDateSlots(updated.doctorId.toString(), updated.date);
          }
        }),
        catchError((err) => {
          console.error('Error al reprogramar turno:', err);
          return throwError(() => err);
        }),
      );
  }

  /**
   * Cancela un turno. Propaga el error en vez de devolver `false`: el backend
   * distingue el motivo (turno ajeno, ya terminal) y el componente necesita
   * poder mostrarlo en lugar de un generico.
   */
  deleteAppointment(id: string): Observable<boolean> {
    return this.http
      .delete(`${this.APPOINTMENTS_URL}/${id}`, this.getAuthHeaders())
      .pipe(
        tap(() => this.invalidateCache()),
        map(() => true),
        catchError((err) => {
          console.error('Error al eliminar turno:', err);
          return throwError(() => err);
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
        tap(() => this.invalidateCache()),
        catchError((err) => {
          console.error('Error al actualizar estado:', err);
          return of(null);
        }),
      );
  }
}
