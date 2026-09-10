import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../services/appointments.service';
import { UserService } from '../services/user.service';
import { AppointmentRequest } from '../../types/AppointmentRequest';
import { SkeletonComponent } from '../skeleton/skeleton.component';
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
  imports: [CommonModule, ReactiveFormsModule, DatePipe, SkeletonComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
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

  diasHabilitados: number[] = [];
  horariosDisponibles: string[] = [];
  horariosOcupados: string[] = [];
  isLoadingSlots = false;
  showSlotsSkeleton = false;
  private slotsTimer: ReturnType<typeof setTimeout> | null = null;
  reservaConfirmada = false;

  today: Date = new Date();
  currentMonthDate: Date = new Date();

  readonly weekDays = ['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'];

  citaForm: FormGroup = this.fb.group({
    fecha: [null, Validators.required],
    hora: ['', Validators.required],
  });

  constructor() {
    this.today.setHours(0, 0, 0, 0);
    this.currentMonthDate.setDate(1);
    this.currentMonthDate.setHours(0, 0, 0, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedule'] && this.schedule) {
      this.mapearDiasHabilitados();
    }
  }

  private mapearDiasHabilitados(): void {
    if (!this.schedule) {
      this.diasHabilitados = [];
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

    this.diasHabilitados = Object.keys(this.schedule)
      .filter((d) => this.schedule?.[d])
      .map((d) => mapaDias[d]);
  }

  get currentMonthLabel(): string {
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
    return `${months[this.currentMonthDate.getMonth()]} ${this.currentMonthDate.getFullYear()}`;
  }

  get canGoPrevMonth(): boolean {
    const viewYear = this.currentMonthDate.getFullYear();
    const viewMonth = this.currentMonthDate.getMonth();
    const currentYear = this.today.getFullYear();
    const currentMonth = this.today.getMonth();

    return viewYear > currentYear || (viewYear === currentYear && viewMonth > currentMonth);
  }

  prevMonth(): void {
    if (!this.canGoPrevMonth) return;
    this.currentMonthDate = new Date(
      this.currentMonthDate.getFullYear(),
      this.currentMonthDate.getMonth() - 1,
      1,
    );
  }

  nextMonth(): void {
    this.currentMonthDate = new Date(
      this.currentMonthDate.getFullYear(),
      this.currentMonthDate.getMonth() + 1,
      1,
    );
  }

  get calendarDays(): CalendarDay[] {
    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();

    const rawFirstDay = new Date(year, month, 1).getDay();
    const firstDayIndex = rawFirstDay === 0 ? 6 : rawFirstDay - 1;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const selectedDate: Date | null = this.citaForm.get('fecha')?.value;

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
        this.diasHabilitados.length === 0 || this.diasHabilitados.includes(date.getDay());

      const isEnabled = !isPast && isDayOfWeekEnabled;

      const isSelected =
        !!selectedDate &&
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate();

      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: true,
        isToday,
        isEnabled,
        isSelected,
      });
    }

    // Días del siguiente mes para completar la grilla (siempre 6 filas = 42 celdas para altura fija sin saltos)
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
  }

  selectDate(day: CalendarDay): void {
    if (!day.isEnabled) return;
    this.citaForm.get('fecha')?.setValue(day.date);
    this.onFechaSeleccionada(day.date);
  }

  selectSlot(hora: string): void {
    this.citaForm.get('hora')?.setValue(hora);
  }

  onFechaSeleccionada(fecha: Date | null): void {
    if (!fecha || !this.availability) return;

    this.isLoadingSlots = true;
    this.showSlotsSkeleton = false;
    if (this.slotsTimer) {
      clearTimeout(this.slotsTimer);
    }
    this.slotsTimer = setTimeout(() => {
      if (this.isLoadingSlots) {
        this.showSlotsSkeleton = true;
      }
    }, 150);

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
      .getAppointmentsByDoctorAndDate(this.doctorId, fechaISO)
      .subscribe({
        next: (appointments) => {
          this.horariosOcupados = appointments.map((a) => a.startTime);
          this.horariosDisponibles = disponibles.filter(
            (h) => !this.horariosOcupados.includes(h),
          );
          this.isLoadingSlots = false;
          this.showSlotsSkeleton = false;
          if (this.slotsTimer) {
            clearTimeout(this.slotsTimer);
            this.slotsTimer = null;
          }
        },
        error: () => {
          this.horariosDisponibles = disponibles;
          this.isLoadingSlots = false;
          this.showSlotsSkeleton = false;
          if (this.slotsTimer) {
            clearTimeout(this.slotsTimer);
            this.slotsTimer = null;
          }
        },
      });
  }

  private formatDateISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get formattedPrice(): string {
    if (!this.consultationPrice || this.consultationPrice <= 0) return 'A convenir';
    return `$${this.consultationPrice.toLocaleString('es-AR')}`;
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

    this.appointmentsService
      .createAppointment(appointmentRequest)
      .subscribe({
        next: () => {
          this.reservaConfirmada = true;
          this.citaForm.disable();
          toast.success('¡Turno reservado con éxito!', { position: 'top-center' });
        },
        error: (err) => {
          if (err?.status === 409) {
            toast.error(
              'El horario seleccionado ya no se encuentra disponible. Por favor, elegí otro turno.',
              { position: 'top-center', duration: 5000 },
            );
            this.onFechaSeleccionada(fecha);
          } else {
            toast.error(
              err?.error?.message ||
                'No se pudo reservar el turno. Por favor, intentá nuevamente.',
              { position: 'top-center' },
            );
          }
        },
      });
  }
}
