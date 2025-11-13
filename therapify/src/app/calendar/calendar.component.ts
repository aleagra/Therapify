import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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

  diasHabilitados: number[] = [];
  horariosDisponibles: string[] = [];

  minDate: Date;
  citaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.citaForm = this.fb.group({
      fecha: [null, Validators.required],
      hora: ['', Validators.required],
    });

    this.minDate = new Date();
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
      .filter((dia) => this.schedule?.[dia])
      .map((dia) => mapaDias[dia.toLowerCase()]);

    console.log('Días habilitados:', this.diasHabilitados);
  }

  filtroDeDias = (d: Date | null): boolean => {
    if (!d) return false;
    if (!this.schedule) return true;
    if (!this.diasHabilitados || this.diasHabilitados.length === 0) return true;

    const day = d.getDay();
    return this.diasHabilitados.includes(day);
  };

  onFechaSeleccionada(fecha: Date | null): void {
    if (!fecha || !this.availability) {
      this.horariosDisponibles = [];
      return;
    }

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

    this.horariosDisponibles = this.availability[diaString] || [];
    this.citaForm.get('hora')?.setValue('');
  }

  confirmarReserva(): void {
    if (this.citaForm.valid) {
      console.log('Formulario Enviado:', this.citaForm.value);
    } else {
      console.log('Formulario inválido. Por favor complete todos los campos.');
    }
  }
}
