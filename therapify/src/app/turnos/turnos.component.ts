import { Component, inject, signal, OnInit } from '@angular/core';
import { Appointment } from '../../types/appointments';
import { AppointmentService } from '../services/appointments.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
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

  // Lista de turnos donde el usuario es paciente
  misTurnos = signal<Appointment[]>([]);
  // Lista de turnos donde el usuario es doctor
  misPacientes = signal<Appointment[]>([]);

  ngOnInit(): void {
    this.actualizarTurnosVencidos();
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe((appointments) => {
      const allAppointments = appointments || [];
      console.log('💡 Todos los turnos traídos del backend:', allAppointments);

      // Separar turnos según rol
      const turnosComoPaciente = allAppointments.filter(
        (a) => a.patientId === this.userLogged?.id,
      );
      const turnosComoDoctor = allAppointments.filter(
        (a) => a.doctorId === this.userLogged?.id,
      );

      this.misTurnos.set(turnosComoPaciente);
      this.misPacientes.set(turnosComoDoctor);

      console.log('Turnos como paciente:', this.misTurnos());
      console.log('Turnos como doctor:', this.misPacientes());
    });
  }

  deleteAppointment(id: string): void {
    this.appointmentService.deleteAppointment(id).subscribe((success) => {
      if (!success) return;

      // Eliminar de ambas listas
      this.misTurnos.set(this.misTurnos().filter((a) => a.id !== id));
      this.misPacientes.set(this.misPacientes().filter((a) => a.id !== id));

      console.log(`Turno eliminado: ${id}`);
    });
  }

  confirmarTurno(id: string): void {
    this.appointmentService
      .updateAppointmentStatus(id, 'CONFIRMED')
      .subscribe((updated) => {
        if (!updated) return;

        // Solo afecta la vista del doctor
        this.misPacientes.set(
          this.misPacientes().map((a) =>
            a.id === id ? { ...a, status: 'CONFIRMED' } : a,
          ),
        );
        console.log(`Turno confirmado: ${id}`, this.misPacientes());
      });
  }

  private actualizarTurnosVencidos(): void {
    this.appointmentService.getMyAppointments().subscribe((appointments) => {
      const ahora = new Date();
      const allAppointments = appointments || [];

      const vencidos = allAppointments.filter((ap) => {
        const fechaCompleta = new Date(`${ap.date}T${ap.endTime}:00`);
        return fechaCompleta < ahora && ap.status !== 'COMPLETED';
      });

      if (vencidos.length === 0) {
        this.loadAppointments();
        return;
      }

      const updates = vencidos.map((ap) =>
        this.appointmentService.updateAppointment(ap.id, {
          status: 'COMPLETED' as const,
        }),
      );

      forkJoin(updates).subscribe(() => {
        console.log(`Turnos vencidos marcados: ${vencidos.length}`, vencidos);
        this.loadAppointments();
      });
    });
  }
}
