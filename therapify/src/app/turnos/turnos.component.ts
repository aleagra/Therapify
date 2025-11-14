import { Component, inject, signal, OnInit } from '@angular/core';
import { Appointment } from '../../types/appointments';
import { AppointmentService } from '../services/appointments.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { User } from '../../types/user';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css'],
})
export class TurnosComponent implements OnInit {
  appointmentService = inject(AppointmentService);
  userService = inject(UserService);

  userLogged = this.userService.getLoggedUser();

  misTurnos = signal<Appointment[]>([]);
  misPacientes = signal<Appointment[]>([]);
  todosLosUsuarios = signal<User[]>([]);

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users) => {
      this.todosLosUsuarios.set(users || []);

      // Actualizar vencidos → luego cargar turnos
      this.actualizarTurnosVencidos();
    });
  }

  loadAppointments(): void {
    if (!this.userLogged) return;

    this.appointmentService.getAppointments().subscribe((all) => {
      const appointments = all || [];

      this.misTurnos.set(
        appointments.filter((a) => a.patientId === this.userLogged!.id)
      );

      this.misPacientes.set(
        appointments.filter((a) => a.doctorId === this.userLogged!.id)
      );
    });
  }

  getNombreCompleto(id: string): string {
    const u = this.todosLosUsuarios().find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : '(Desconocido)';
  }

  deleteAppointment(id: string): void {
    this.appointmentService.deleteAppointment(id).subscribe((success) => {
      if (success) {
        this.misTurnos.set(this.misTurnos().filter((a) => a.id !== id));
        this.misPacientes.set(this.misPacientes().filter((a) => a.id !== id));
      }
    });
  }

  confirmarTurno(id: string): void {
    this.appointmentService
      .updateAppointmentStatus(id, 'confirmed')
      .subscribe((updated) => {
        if (!updated) return;

        this.misPacientes.set(
          this.misPacientes().map((a) =>
            a.id === id ? { ...a, status: 'confirmed' } : a
          )
        );
      });
  }

  // -------------------------------------------------
  // MARCAR TURNOS VENCIDOS (SIN FILTRAR POR USUARIO)
  // -------------------------------------------------
  private actualizarTurnosVencidos(): void {
    this.appointmentService.getAppointments().subscribe((appointments) => {
      const ahora = new Date();

      // SOLO vence si la fecha + endTime está en el pasado
      const vencidos = (appointments || []).filter((ap) => {
        const fechaCompleta = new Date(`${ap.date}T${ap.endTime}:00`);
        return fechaCompleta < ahora && ap.status !== 'completed';
      });

      if (vencidos.length === 0) {
        this.loadAppointments();
        return;
      }

      const updates = vencidos.map((ap) =>
        this.appointmentService.updateAppointment(ap.id, {
          status: 'completed' as const,
        })
      );

      forkJoin(updates).subscribe(() => {
        console.log(`Turnos vencidos marcados: ${vencidos.length}`);
        this.loadAppointments();
      });
    });
  }
}
