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
  apiUrl = 'http://localhost:3000/appointments';

  // Crear turno
  createAppointment(ap: Omit<Appointment, 'id'>) {
    return this.http.post<Appointment>(this.apiUrl, ap).pipe(
      catchError((err) => {
        console.error('Error al crear turno:', err);
        return of(null);
      })
    );
  }

  // Obtener todos los turnos
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error al obtener turnos:', err);
        return of([]);
      })
    );
  }

  // Obtener un turno por ID
  getAppointmentById(id: string): Observable<Appointment | null> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al obtener turno por ID:', err);
        return of(null);
      })
    );
  }

  // Obtener turnos por médico
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

  // Obtener turnos por paciente
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

  // Actualizar un turno
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

  // Eliminar turno
  deleteAppointment(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error al eliminar turno:', err);
        return of(false);
      }),
      // Convertir respuesta en boolean
      map(() => true)
    );
  }
  getAppointmentsByDoctorAndDate(doctorId: string, date: string) {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}?doctorId=${doctorId}&date=${date}`
    );
  }
}
