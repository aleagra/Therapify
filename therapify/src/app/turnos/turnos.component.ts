import { Component, inject, signal, OnInit, computed } from '@angular/core';
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

  turnosPacienteRaw = signal<Appointment[]>([]);
  turnosDoctorRaw = signal<Appointment[]>([]);
  turnosAdminRaw = signal<Appointment[]>([]);

  mostrarCompletadosPaciente = signal(true);
  mostrarCompletadosDoctor = signal(true);
  mostrarCompletadosAdmin = signal(true);

  ordenPacienteAsc = signal(true);
  ordenDoctorAsc = signal(true);
  ordenAdminAsc = signal(true);

  misTurnos = computed(() =>
    this.procesarTurnos(
      this.turnosPacienteRaw(),
      this.mostrarCompletadosPaciente(),
      this.ordenPacienteAsc(),
    ),
  );

  misPacientes = computed(() =>
    this.procesarTurnos(
      this.turnosDoctorRaw(),
      this.mostrarCompletadosDoctor(),
      this.ordenDoctorAsc(),
    ),
  );

  turnosAdmin = computed(() =>
    this.procesarTurnos(
      this.turnosAdminRaw(),
      this.mostrarCompletadosAdmin(),
      this.ordenAdminAsc(),
    ),
  );

  ngOnInit(): void {
    this.actualizarTurnosVencidos();
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe((appointments) => {
      const allAppointments = appointments || [];
      const isAdmin = this.userLogged?.userType === 'ADMIN';

      if (isAdmin) {
        this.turnosAdminRaw.set(allAppointments);
        return;
      }

      this.turnosPacienteRaw.set(
        allAppointments.filter((a) => a.patientId === this.userLogged?.id),
      );

      this.turnosDoctorRaw.set(
        allAppointments.filter((a) => a.doctorId === this.userLogged?.id),
      );
    });
  }

  deleteAppointment(id: string): void {
    this.appointmentService.deleteAppointment(id).subscribe((success) => {
      if (!success) return;

      this.turnosPacienteRaw.update((list) => list.filter((a) => a.id !== id));
      this.turnosDoctorRaw.update((list) => list.filter((a) => a.id !== id));
      this.turnosAdminRaw.update((list) => list.filter((a) => a.id !== id));
    });
  }

  confirmarTurno(id: string): void {
    this.appointmentService
      .updateAppointmentStatus(id, 'CONFIRMED')
      .subscribe((updated) => {
        if (!updated) return;

        this.turnosDoctorRaw.update((list) =>
          list.map((a) => (a.id === id ? { ...a, status: 'CONFIRMED' } : a)),
        );
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

      forkJoin(updates).subscribe(() => this.loadAppointments());
    });
  }

  traducirEstado(status: string | undefined): string {
    if (!status) return '';

    const mapa: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
      COMPLETED: 'Completado',
    };

    return mapa[status] ?? status.toLowerCase();
  }

  private procesarTurnos(
    turnos: Appointment[],
    mostrarCompletados: boolean,
    asc: boolean,
  ): Appointment[] {
    let resultado = turnos.filter(
      (t) => mostrarCompletados || t.status !== 'COMPLETED',
    );

    resultado.sort((a, b) => {
      const fechaA = new Date(`${a.date}T${a.startTime}`).getTime();
      const fechaB = new Date(`${b.date}T${b.startTime}`).getTime();
      return asc ? fechaA - fechaB : fechaB - fechaA;
    });

    return resultado;
  }
}
