import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentService } from '../services/appointments.service';
import { UserService } from '../services/user.service';
import { AppointmentRequest } from '../../types/AppointmentRequest';
import { businessClock, businessClockKey } from '../config/timezone';
import { appointmentErrorMessage } from '../config/appointment-errors';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { SlotEndPipe } from '../pipes/slot-end.pipe';
import { toast } from 'ngx-sonner';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isEnabled: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    SkeletonComponent,
    SlotEndPipe,
    RouterLink,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnChanges {
  @Input() schedule: { [dia: string]: boolean } | undefined;
  @Input() availability: { [dia: string]: string[] } | undefined;
  @Input() doctorId!: string;
  @Input() consultationPrice?: number;
  @Input() isInitialLoading: boolean = false;
  /** 'panel': tarjeta unica en columna. 'split': calendario arriba y resumen en banda aparte. */
  @Input() layout: 'panel' | 'split' = 'panel';

  fb = inject(FormBuilder);
  userService = inject(UserService);
  appointmentsService = inject(AppointmentService);

  userLogged = this.userService.getLoggedUser();

  get isUserAdmin(): boolean {
    return this.userLogged?.userType === 'ADMIN';
  }

  isDemo = computed(() => this.userService.isDemoSignal());

  /** El backend manda un mail al confirmar. En las cuentas demo la casilla no
   *  es accesible, asi que lo decimos en vez de dejar la funcionalidad muda. */
  confirmationEmailNote = computed(() =>
    this.isDemo()
      ? 'Aviso enviado a la casilla demo (no accesible).'
      : 'Te enviamos los detalles por mail.',
  );

  private route = inject(ActivatedRoute);

  /** Id del turno que se esta moviendo, via ?reschedule=<id>. Null = reserva normal. */
  rescheduleId = signal<string | null>(
    this.route.snapshot.queryParamMap.get('reschedule'),
  );
  /** Fecha y hora del turno original, pasadas por /turnos que ya las tiene.
   *  Evita un GET /appointments/{id} que ademas el backend rechaza con 403. */
  rescheduleFrom = signal<{ date: string; startTime: string } | null>(
    (() => {
      const params = this.route.snapshot.queryParamMap;
      const date = params.get('from');
      const startTime = params.get('at');
      return date && startTime ? { date, startTime } : null;
    })(),
  );
  isRescheduling = computed(() => !!this.rescheduleId());

  readonly today: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  currentMonthDate = signal<Date>(
    (() => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    })(),
  );

  diasHabilitados = signal<number[]>([]);
  selectedDate = signal<Date | null>(null);
  selectedSlot = signal<string | null>(null);

  horariosDisponibles = signal<string[]>([]);
  horariosOcupados = signal<string[]>([]);
  isLoadingSlots = signal(false);
  showSlotsSkeleton = signal(false);
  private slotsTimer: ReturnType<typeof setTimeout> | null = null;
  reservaConfirmada = signal(false);

  readonly weekDays = ['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'];

  citaForm: FormGroup = this.fb.group({
    fecha: [null, Validators.required],
    hora: ['', Validators.required],
  });

  canGoPrevMonth = computed(() => {
    const viewYear = this.currentMonthDate().getFullYear();
    const viewMonth = this.currentMonthDate().getMonth();
    const currentYear = this.today.getFullYear();
    const currentMonth = this.today.getMonth();

    return (
      viewYear > currentYear ||
      (viewYear === currentYear && viewMonth > currentMonth)
    );
  });

  currentMonthLabel = computed(() => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const d = this.currentMonthDate();
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  });

  calendarDays = computed(() => {
    const viewDate = this.currentMonthDate();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const rawFirstDay = new Date(year, month, 1).getDay();
    const firstDayIndex = rawFirstDay === 0 ? 6 : rawFirstDay - 1;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const selDate = this.selectedDate();
    const habilitados = this.diasHabilitados();

    // Días del mes anterior (relleno)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isEnabled: false,
        isSelected: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);

      const isToday =
        date.getFullYear() === this.today.getFullYear() &&
        date.getMonth() === this.today.getMonth() &&
        date.getDate() === this.today.getDate();

      const isPast = date < this.today;
      const isDayOfWeekEnabled =
        habilitados.length === 0 || habilitados.includes(date.getDay());

      const isEnabled = !isPast && isDayOfWeekEnabled;

      const isSelected =
        !!selDate &&
        date.getFullYear() === selDate.getFullYear() &&
        date.getMonth() === selDate.getMonth() &&
        date.getDate() === selDate.getDate();

      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: true,
        isToday,
        isEnabled,
        isSelected,
      });
    }

    // Días del siguiente mes para completar la grilla (siempre 6 filas = 42 celdas)
    const totalCells = 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        isEnabled: false,
        isSelected: false,
      });
    }

    return days;
  });

  hasPrice = computed(() => {
    return !!(this.consultationPrice && this.consultationPrice > 0);
  });

  formattedPrice = computed(() => {
    if (!this.consultationPrice || this.consultationPrice <= 0) return 'A consultar';
    return `$${this.consultationPrice.toLocaleString('es-AR')}`;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedule'] && this.schedule) {
      this.mapearDiasHabilitados();
    }
  }

  private mapearDiasHabilitados(): void {
    if (!this.schedule) {
      this.diasHabilitados.set([]);
      return;
    }

    const mapaDias: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const habilitados = Object.keys(this.schedule)
      .filter((d) => this.schedule?.[d])
      .map((d) => mapaDias[d]);
    this.diasHabilitados.set(habilitados);
  }

  prevMonth(): void {
    if (!this.canGoPrevMonth()) return;
    this.currentMonthDate.update(
      (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
    );
  }

  nextMonth(): void {
    this.currentMonthDate.update(
      (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
    );
  }

  selectDate(day: CalendarDay): void {
    if (!day.isEnabled) return;
    this.selectedDate.set(day.date);
    this.citaForm.get('fecha')?.setValue(day.date);
    this.selectedSlot.set(null);
    this.citaForm.get('hora')?.setValue('');
    this.onFechaSeleccionada(day.date);
  }

  selectSlot(hora: string): void {
    this.selectedSlot.set(hora);
    this.citaForm.get('hora')?.setValue(hora);
  }

  onFechaSeleccionada(fecha: Date | null, forceRefresh = false): void {
    if (!fecha || !this.availability) return;

    this.isLoadingSlots.set(true);
    this.showSlotsSkeleton.set(false);
    if (this.slotsTimer) {
      clearTimeout(this.slotsTimer);
    }
    this.slotsTimer = setTimeout(() => {
      if (this.isLoadingSlots()) {
        this.showSlotsSkeleton.set(true);
      }
    }, 150);

    this.selectedSlot.set(null);
    this.citaForm.get('hora')?.setValue('');

    const dias = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const diaString = dias[fecha.getDay()];
    const fechaISO = this.formatDateISO(fecha);
    const disponibles = [...(this.availability[diaString] || [])];

    this.appointmentsService
      .getAppointmentsByDoctorAndDate(this.doctorId, fechaISO, forceRefresh)
      .subscribe({
        next: (appointments) => {
          const ocupados = appointments.map((a) => a.startTime);
          this.horariosOcupados.set(ocupados);
          this.horariosDisponibles.set(
            this.descartarHorariosPasados(
              fecha,
              disponibles.filter((h) => !ocupados.includes(h)),
            ),
          );
          this.isLoadingSlots.set(false);
          this.showSlotsSkeleton.set(false);
          if (this.slotsTimer) {
            clearTimeout(this.slotsTimer);
            this.slotsTimer = null;
          }
        },
        error: () => {
          this.horariosDisponibles.set(
            this.descartarHorariosPasados(fecha, disponibles),
          );
          this.isLoadingSlots.set(false);
          this.showSlotsSkeleton.set(false);
          if (this.slotsTimer) {
            clearTimeout(this.slotsTimer);
            this.slotsTimer = null;
          }
        },
      });
  }

  private enviarReprogramacion(fecha: Date, hora: string): void {
    const id = this.rescheduleId();
    if (!id) return;

    const fechaISO = this.formatDateISO(fecha);

    this.appointmentsService
      .rescheduleAppointment(id, {
        date: fechaISO,
        startTime: hora,
        endTime: this.calcularFin(hora),
      })
      .subscribe({
        next: () => {
          this.reservaConfirmada.set(true);
          this.citaForm.disable();
          this.appointmentsService.invalidateDoctorDateSlots(this.doctorId, fechaISO);
          toast.success('¡Turno reprogramado con éxito!', {
            description: this.confirmationEmailNote(),
            position: 'top-center',
            duration: 5000,
          });
        },
        error: (err) => {
          const slotTaken =
            err?.error?.code === 'SLOT_TAKEN' ||
            (err?.status === 409 && !err?.error?.code);

          toast.error(appointmentErrorMessage(err, 'reprogramar'), {
            position: 'top-center',
            duration: 5000,
          });

          // Solo relimpiamos la seleccion cuando el problema es el horario:
          // si el turno agoto sus reprogramaciones, elegir otro slot no ayuda.
          if (slotTaken) {
            this.selectedSlot.set(null);
            this.citaForm.get('hora')?.setValue(null);
            this.appointmentsService.invalidateDoctorDateSlots(this.doctorId, fechaISO);
            this.onFechaSeleccionada(fecha, true);
          }
        },
      });
  }

  /**
   * Descarta los horarios que ya pasaron. Los dias previos ya estan
   * deshabilitados en la grilla, pero dentro del dia de hoy la plantilla
   * semanal devuelve la jornada completa: sin esto se podia reservar a las
   * 09:00 siendo las 15:00, y el turno nacia vencido.
   */
  private descartarHorariosPasados(fecha: Date, horarios: string[]): string[] {
    const ahora = businessClock();
    const fechaISO = this.formatDateISO(fecha);
    // Solo el dia en curso necesita recorte; los anteriores ya estan
    // deshabilitados en la grilla y los futuros no tienen horas vencidas.
    if (fechaISO !== ahora.slice(0, 10)) return horarios;

    return horarios.filter((h) => businessClockKey(fechaISO, h) > ahora);
  }

  private formatDateISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calcularFin(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const endHour = (h + 1).toString().padStart(2, '0');
    const endMin = m.toString().padStart(2, '0');
    return `${endHour}:${endMin}`;
  }

  confirmarReserva(): void {
    if (this.userLogged?.userType === 'ADMIN') {
      toast.error('Los administradores no pueden sacar turnos.', {
        position: 'top-center',
      });
      return;
    }
    if (this.citaForm.invalid || !this.userLogged || !this.doctorId) return;

    const fechaRaw = this.citaForm.get('fecha')!.value;
    const hora = this.citaForm.get('hora')!.value;
    const fecha = fechaRaw instanceof Date ? fechaRaw : new Date(fechaRaw);

    const appointmentRequest: AppointmentRequest = {
      doctorId: this.doctorId,
      patientId: this.userLogged.id,
      date: this.formatDateISO(fecha),
      startTime: hora,
      endTime: this.calcularFin(hora),
      status: 'PENDING',
    };

    if (this.isRescheduling()) {
      this.enviarReprogramacion(fecha, hora);
      return;
    }

    this.appointmentsService
      .createAppointment(appointmentRequest)
      .subscribe({
        next: () => {
          this.reservaConfirmada.set(true);
          this.citaForm.disable();
          this.appointmentsService.invalidateDoctorDateSlots(this.doctorId, this.formatDateISO(fecha));
          toast.success('¡Turno reservado con éxito!', {
            description: this.confirmationEmailNote(),
            position: 'top-center',
            duration: 5000,
          });
        },
        error: (err) => {
          if (err?.status === 409) {
            toast.error(
              'El horario seleccionado ya no se encuentra disponible. Por favor, elegí otro turno.',
              { position: 'top-center', duration: 5000 },
            );
            this.selectedSlot.set(null);
            this.citaForm.get('hora')?.setValue(null);
            this.appointmentsService.invalidateDoctorDateSlots(this.doctorId, this.formatDateISO(fecha));
            this.onFechaSeleccionada(fecha, true);
          } else {
            toast.error(appointmentErrorMessage(err, 'reservar'), {
              position: 'top-center',
              duration: 5000,
            });
          }
        },
      });
  }
}
