import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Appointment } from '../../types/appointments';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  http = inject(HttpClient);

  // Ruta BASE correcta
  apiUrl = 'http://localhost:3000/appointments';

  // === CREAR TURNO ===
  createAppointment(ap: Omit<Appointment, 'id'>) {
    return this.http.post<Appointment>(this.apiUrl, ap).pipe(
      catchError((err) => {
        console.error('Error al crear turno:', err);
        return of(null);
      })
    );
  }

  // === OBTENER TODOS LOS TURNOS ===
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error al obtener turnos:', err);
        return of([]);
      })
    );
  }

  // === OBTENER TURNO POR ID ===
  getAppointmentById(id: string): Observable<Appointment | null> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al obtener turno por ID:', err);
        return of(null);
      })
    );
  }

  // === OBTENER TURNOS POR DOCTOR ===
  getAppointmentsByDoctor(doctorId: string): Observable<Appointment[]> {
    return this.http
      .get<Appointment[]>(`${this.apiUrl}?doctorId=${doctorId}`)
      .pipe(
        catchError((err) => {
          console.error('Error al obtener turnos del doctor:', err);
          return of([]);
        })
      );
  }

  // === OBTENER TURNOS POR PACIENTE ===
  getAppointmentsByPatient(patientId: string): Observable<Appointment[]> {
    return this.http
      .get<Appointment[]>(`${this.apiUrl}?patientId=${patientId}`)
      .pipe(
        catchError((err) => {
          console.error('Error al obtener turnos del paciente:', err);
          return of([]);
        })
      );
  }

  // === ACTUALIZAR TURNO (GENÉRICO) ===
  updateAppointment(
    id: string,
    appointment: Partial<Appointment>
  ): Observable<Appointment | null> {
    return this.http
      .patch<Appointment>(`${this.apiUrl}/${id}`, appointment)
      .pipe(
        catchError((err) => {
          console.error('Error al actualizar turno:', err);
          return of(null);
        })
      );
  }

  // === ELIMINAR UN TURNO ===
  deleteAppointment(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError((err) => {
        console.error('Error al eliminar turno:', err);
        return of(false);
      })
    );
  }

  // === OBTENER TURNOS POR DOCTOR + FECHA ===
  getAppointmentsByDoctorAndDate(doctorId: string, date: string) {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}?doctorId=${doctorId}&date=${date}`
    );
  }

  // === CAMBIAR ESTADO DEL TURNO (CONFIRMAR/CANCELAR) ===
  updateAppointmentStatus(id: string, status: string) {
    return this.http
      .patch<Appointment>(`${this.apiUrl}/${id}`, { status })
      .pipe(
        catchError((err) => {
          console.error('Error al actualizar estado del turno:', err);
          return of(null);
        })
      );
  }
}
