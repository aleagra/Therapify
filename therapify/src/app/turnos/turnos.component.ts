import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Appointment } from '../../types/appointments';
import { AppointmentService } from '../services/appointments.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { concat, forkJoin, of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { DatePartPipe } from '../pipes/date-part.pipe';
import { InitialsPipe } from '../pipes/initials.pipe';
import { StatusLabelPipe } from '../pipes/status-label.pipe';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SkeletonComponent,
    DatePartPipe,
    InitialsPipe,
    StatusLabelPipe,
  ],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnosComponent implements OnInit {
  appointmentService = inject(AppointmentService);
  userService = inject(UserService);

  userLogged = this.userService.getLoggedUser();
  mobileActiveTab = signal<'turnos' | 'pacientes'>('turnos');

  isLoading = signal(true);
  loadError = signal<string | null>(null);

  private skeletonShownTime: number | null = null;

  private readonly skeletonState = toSignal(
    toObservable(this.isLoading).pipe(
      switchMap((loading) => {
        if (loading) {
          this.skeletonShownTime = null;
          return concat(
            of({ displayLoading: true, showSkeleton: false }),
            timer(150).pipe(
              tap(() => {
                this.skeletonShownTime = Date.now();
              }),
              map(() => ({ displayLoading: true, showSkeleton: true })),
            ),
          );
        } else {
          if (this.skeletonShownTime !== null) {
            const elapsed = Date.now() - this.skeletonShownTime;
            const remaining = Math.max(0, 350 - elapsed);
            this.skeletonShownTime = null;
            if (remaining > 0) {
              return timer(remaining).pipe(
                map(() => ({ displayLoading: false, showSkeleton: false })),
              );
            }
          }
          this.skeletonShownTime = null;
          return of({ displayLoading: false, showSkeleton: false });
        }
      }),
    ),
    { initialValue: { displayLoading: true, showSkeleton: false } },
  );

  showSkeleton = computed(() => this.skeletonState().showSkeleton);
  displayLoading = computed(() => this.skeletonState().displayLoading);

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
    this.reload();
  }

  reload(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getMyAppointments({ size: 100 }).subscribe({
      next: (response) => {
        const allAppointments: Appointment[] =
          response?.content ?? (Array.isArray(response) ? (response as any) : []);

        // Verificamos si hay turnos pasados que deban marcarse como COMPLETED
        const ahora = new Date();
        const vencidos = allAppointments.filter((ap) => {
          const fechaCompleta = new Date(`${ap.date}T${ap.endTime}:00`);
          return fechaCompleta < ahora && ap.status !== 'COMPLETED';
        });

        // Reflejamos de inmediato el estado en memoria para que la UI no espere
        if (vencidos.length > 0) {
          for (const ap of vencidos) {
            ap.status = 'COMPLETED';
          }
          // Sincronizamos con el servidor en segundo plano sin relanzar getMyAppointments()
          const updates = vencidos.map((ap) =>
            this.appointmentService.updateAppointment(ap.id, {
              status: 'COMPLETED' as const,
            }),
          );
          forkJoin(updates).subscribe({
            error: (err) =>
              console.debug('Error sincronizando turnos vencidos en background:', err),
          });
        }

        const isAdmin = this.userLogged?.userType === 'ADMIN';

        if (isAdmin) {
          this.turnosAdminRaw.set([...allAppointments]);
        } else {
          this.turnosPacienteRaw.set(
            allAppointments.filter((a) => a.patientId === this.userLogged?.id),
          );

          this.turnosDoctorRaw.set(
            allAppointments.filter((a) => a.doctorId === this.userLogged?.id),
          );
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('No pudimos cargar tus turnos.');
      },
    });
  }

  deleteAppointment(id: string): void {
    this.appointmentService.deleteAppointment(id).subscribe({
      next: (success) => {
        if (!success) {
          toast.error('No se pudo eliminar el turno', {
            position: 'top-center',
          });
          return;
        }

        this.turnosPacienteRaw.update((list) =>
          list.filter((a) => a.id !== id),
        );
        this.turnosDoctorRaw.update((list) => list.filter((a) => a.id !== id));
        this.turnosAdminRaw.update((list) => list.filter((a) => a.id !== id));

        toast.success('Turno eliminado correctamente 🗑️', {
          position: 'top-center',
        });
      },
      error: () =>
        toast.error('Error al eliminar el turno', {
          position: 'top-center',
        }),
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

  formatFecha(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: 'numeric',
          month: 'long',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  getDayNumber(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts[2] || dateStr;
  }

  getMonthShort(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase();
      }
      return '';
    } catch {
      return '';
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
