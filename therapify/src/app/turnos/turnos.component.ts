import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Appointment } from '../../types/appointments';
import { AppointmentService } from '../services/appointments.service';
import { businessClock, businessClockKey } from '../config/timezone';
import { appointmentErrorMessage } from '../config/appointment-errors';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { concat, of, timer } from 'rxjs';
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

        // Completar turnos vencidos es responsabilidad del job @Scheduled del
        // backend, no del cliente: antes cada navegador que abria esta pantalla
        // intentaba escribir en la base y se comia un 403 por turno vencido.
        // El listado ya los trata como pasados por fecha, sin depender del status.

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
      next: () => {
        this.turnosPacienteRaw.update((list) =>
          list.filter((a) => a.id !== id),
        );
        this.turnosDoctorRaw.update((list) => list.filter((a) => a.id !== id));
        this.turnosAdminRaw.update((list) => list.filter((a) => a.id !== id));

        toast.success('Turno cancelado', {
          description: this.cancelEmailNote(),
          position: 'top-center',
          duration: 5000,
        });
      },
      error: (err) => {
        toast.error(appointmentErrorMessage(err, 'cancelar'), {
          position: 'top-center',
          duration: 5000,
        });
        // El turno sigue vivo en el servidor: recargamos para no dejar la lista
        // mostrando algo distinto de lo que hay.
        this.loadAppointments();
      },
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

  /**
   * El backend exige mas de 24 h de anticipacion para reprogramar, pero no para
   * reservar. Sin esto, un turno sacado para dentro de 2 h muestra el boton
   * "Reprogramar", el usuario elige horario nuevo y recien ahi come un 409.
   */
  /**
   * El backend avisa por mail al cancelar, igual que al reservar y reprogramar.
   * En las cuentas demo la casilla no es accesible, asi que lo decimos en vez
   * de dejar la funcionalidad muda para el evaluador.
   */
  cancelEmailNote(): string {
    return this.userService.isDemoSignal()
      ? 'Aviso enviado a la casilla demo (no accesible).'
      : 'Te enviamos la confirmación por mail.';
  }

  /** COMPLETED y EXPIRED son estados terminales: el turno ya no admite acciones. */
  estaCerrado(ap: Appointment): boolean {
    return ap.status === 'COMPLETED' || ap.status === 'EXPIRED';
  }

  /**
   * Solo un turno CONFIRMED que se realizo habilita resena. Un EXPIRED nunca
   * fue aceptado por el profesional, asi que el backend tambien lo rechaza.
   */
  puedeResenar(ap: Appointment): boolean {
    return ap.status === 'COMPLETED';
  }

  puedeReprogramar(ap: Appointment): boolean {
    if (this.estaCerrado(ap)) return false;
    // Sumamos 24 h al instante real y recien ahi lo pasamos a reloj argentino,
    // para que la comparacion coincida con la que hace el backend.
    const corte = businessClock(Date.now() + 24 * 60 * 60 * 1000);
    return businessClockKey(ap.date, ap.startTime) > corte;
  }

  private procesarTurnos(
    turnos: Appointment[],
    mostrarCompletados: boolean,
    asc: boolean,
  ): Appointment[] {
    // Un turno cuenta como pasado si el servidor lo marco COMPLETED o si su
    // horario de fin ya quedo atras. Lo segundo hace que el listado sea
    // correcto aunque el status nunca haya llegado a persistirse.
    const ahora = businessClock();
    const yaOcurrio = (t: Appointment): boolean =>
      t.status === 'COMPLETED' ||
      t.status === 'EXPIRED' ||
      businessClockKey(t.date, t.endTime) < ahora;

    let resultado = turnos.filter((t) => mostrarCompletados || !yaOcurrio(t));

    resultado.sort((a, b) => {
      const fechaA = new Date(`${a.date}T${a.startTime}`).getTime();
      const fechaB = new Date(`${b.date}T${b.startTime}`).getTime();
      return asc ? fechaA - fechaB : fechaB - fechaA;
    });

    return resultado;
  }
}
