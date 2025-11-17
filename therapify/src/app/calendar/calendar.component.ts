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
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AppointmentService } from '../services/appointments.service';
import { UserService } from '../services/user.service';
import { Appointment } from '../../types/appointments';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnChanges {
  @Input() schedule: { [dia: string]: boolean } | undefined;
  @Input() availability: { [dia: string]: string[] } | undefined;
  @Input() doctorId!: string;

  fb = inject(FormBuilder);
  userService = inject(UserService);
  appointmentsService = inject(AppointmentService);

  userLogged = this.userService.getLoggedUser();

  diasHabilitados: number[] = [];
  horariosDisponibles: string[] = [];
  horariosOcupados: string[] = [];

  minDate: Date = new Date();

  citaForm: FormGroup = this.fb.group({
    fecha: [null, Validators.required],
    hora: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedule'] && this.schedule) {
      this.mapearDiasHabilitados();
    }
  }

  private mapearDiasHabilitados() {
    if (!this.schedule) {
      this.diasHabilitados = [];
      return;
    }

    const mapaDias: any = {
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

  filtroDeDias = (d: Date | null): boolean => {
    if (!d) return false;
    if (this.diasHabilitados.length === 0) return true;
    return this.diasHabilitados.includes(d.getDay());
  };

  onFechaSeleccionada(fecha: Date | null): void {
    if (!fecha || !this.availability) return;

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
    const fechaISO = fecha.toISOString().split('T')[0];

    this.horariosDisponibles = [...(this.availability[diaString] || [])];

    this.appointmentsService
      .getAppointmentsByDoctorAndDate(this.doctorId, fechaISO)
      .subscribe((appointments) => {
        this.horariosOcupados = appointments.map((a) => a.startTime);

        this.horariosDisponibles = this.horariosDisponibles.filter(
          (h) => !this.horariosOcupados.includes(h)
        );

        this.citaForm.get('hora')?.setValue('');
      });
  }

  calcularFin(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const endHour = (h + 1).toString().padStart(2, '0');
    const endMin = m.toString().padStart(2, '0');
    return `${endHour}:${endMin}`;
  }
  reservaConfirmada = false;

  confirmarReserva() {
    if (this.citaForm.invalid || !this.userLogged || !this.doctorId) return;
    const fechaRaw = this.citaForm.get('fecha')!.value;
    const hora = this.citaForm.get('hora')!.value;
    const fecha = fechaRaw instanceof Date ? fechaRaw : new Date(fechaRaw);

    const appointment: Omit<Appointment, 'id'> = {
      doctorId: this.doctorId,
      patientId: this.userLogged.id,
      date: fecha.toISOString().split('T')[0],
      startTime: hora,
      endTime: this.calcularFin(hora),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.appointmentsService.createAppointment(appointment).subscribe(() => {
      console.log('Turno creado!');
      this.reservaConfirmada = true;
      this.citaForm.disable();
    });
  }
}
