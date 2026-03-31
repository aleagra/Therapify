import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../../types/user';
import { NgFor, NgIf } from '@angular/common';
import { UserRequestDTO } from '../../types/UserRequestDTO';
import { toast } from 'ngx-sonner';

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

@Component({
  selector: 'app-profile-doctor',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './profile-doctor.component.html',
  styleUrls: ['./profile-doctor.component.css'],
})
export class ProfileDoctorComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  user!: User;
  loading = false;

  weekDays = [
    { label: 'Lunes', control: 'monday' as WeekDay },
    { label: 'Martes', control: 'tuesday' as WeekDay },
    { label: 'Miércoles', control: 'wednesday' as WeekDay },
    { label: 'Jueves', control: 'thursday' as WeekDay },
    { label: 'Viernes', control: 'friday' as WeekDay },
  ];

  scheduleValidator: ValidatorFn = (
    group: AbstractControl,
  ): ValidationErrors | null => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    for (const day of days) {
      const enabled = group.get(day)?.value;
      const start = group.get(`${day}Start`)?.value;
      const end = group.get(`${day}End`)?.value;

      if (!enabled) continue;

      if (!start || !end) {
        return { scheduleInvalid: 'Hay días activos sin horario completo' };
      }

      const [s] = start.split(':').map(Number);
      const [e] = end.split(':').map(Number);

      if (e <= s) {
        return { scheduleInvalid: 'La hora fin debe ser mayor al inicio' };
      }

      if (s < 0 || e > 23) {
        return { scheduleInvalid: 'Horario fuera del rango permitido' };
      }
    }

    return null;
  };

  formSchedule: FormGroup = this.fb.group(
    {
      monday: [false],
      mondayStart: [''],
      mondayEnd: [''],

      tuesday: [false],
      tuesdayStart: [''],
      tuesdayEnd: [''],

      wednesday: [false],
      wednesdayStart: [''],
      wednesdayEnd: [''],

      thursday: [false],
      thursdayStart: [''],
      thursdayEnd: [''],

      friday: [false],
      fridayStart: [''],
      fridayEnd: [''],

      description: [''],
      specialty: [''],
      consultationPrice: [null],
    },
    { validators: this.scheduleValidator },
  );

  ngOnInit() {
    const loggedUser = this.userService.getLoggedUser();
    if (!loggedUser) {
      toast.warning('No hay sesión activa');
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(loggedUser.id).subscribe({
      next: (res) => {
        if (!res) {
          toast.error('Error al cargar usuario');
          return;
        }

        this.user = res;

        if (res.userType === 'DOCTOR') {
          this.patchScheduleForm();
        }

        this.weekDays.forEach((day) => {
          this.formSchedule.get(day.control)?.valueChanges.subscribe((v) => {
            if (!v) {
              this.formSchedule.patchValue(
                {
                  [`${day.control}Start`]: '',
                  [`${day.control}End`]: '',
                },
                { emitEvent: false },
              );
            }
          });
        });
      },
    });
  }

  patchScheduleForm() {
    const scheduleObj =
      typeof this.user.schedule === 'string'
        ? JSON.parse(this.user.schedule)
        : (this.user.schedule ?? {});

    const availabilityObj =
      typeof this.user.availability === 'string'
        ? JSON.parse(this.user.availability)
        : (this.user.availability ?? {});

    const patch: any = {};

    for (const day of this.weekDays) {
      const key = day.control;

      const enabled = scheduleObj[key] ?? false;
      const slots = availabilityObj[key] ?? [];

      const start = slots.length ? slots[0] : '';
      const last = slots.length ? slots[slots.length - 1] : null;

      let end = '';
      if (last) {
        const hour = parseInt(last.split(':')[0], 10) + 1;
        end = `${hour.toString().padStart(2, '0')}:00`;
      }

      patch[key] = enabled;
      patch[`${key}Start`] = start;
      patch[`${key}End`] = end;
    }

    patch.description = this.user.description ?? '';
    patch.specialty = this.user.specialty ?? '';
    patch.consultationPrice = this.user.consultationPrice ?? null;

    this.formSchedule.patchValue(patch);
  }

  generateHourSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    if (!start || !end) return slots;

    const [s] = start.split(':').map(Number);
    const [e] = end.split(':').map(Number);

    for (let h = s; h < e; h++)
      slots.push(`${h.toString().padStart(2, '0')}:00`);

    return slots;
  }

  onSubmitMedical() {
    if (this.formSchedule.invalid) {
      toast.error('Hay horarios inválidos');
      return;
    }

    const f = this.formSchedule.getRawValue();

    const schedule: Record<WeekDay, boolean> = {
      monday: f.monday,
      tuesday: f.tuesday,
      wednesday: f.wednesday,
      thursday: f.thursday,
      friday: f.friday,
    };

    const availability: Record<WeekDay, string[]> = {
      monday: f.monday
        ? this.generateHourSlots(f.mondayStart, f.mondayEnd)
        : [],
      tuesday: f.tuesday
        ? this.generateHourSlots(f.tuesdayStart, f.tuesdayEnd)
        : [],
      wednesday: f.wednesday
        ? this.generateHourSlots(f.wednesdayStart, f.wednesdayEnd)
        : [],
      thursday: f.thursday
        ? this.generateHourSlots(f.thursdayStart, f.thursdayEnd)
        : [],
      friday: f.friday
        ? this.generateHourSlots(f.fridayStart, f.fridayEnd)
        : [],
    };

    const dto: UserRequestDTO = {
      description: f.description,
      schedule,
      availability,
      consultationPrice: f.consultationPrice,
      ...(f.specialty ? { specialty: f.specialty } : {}),
    };

    this.loading = true;

    this.userService.updateUser(dto).subscribe({
      next: () => {
        this.loading = false;
        toast.success('Agenda actualizada');
      },
      error: () => {
        this.loading = false;
        toast.error('Error al guardar agenda');
      },
    });
  }
  cancelMedical() {
    if (!this.user || this.user.userType !== 'DOCTOR') return;

    this.patchScheduleForm();
    this.formSchedule.patchValue({
      description: this.user.description ?? '',
    });
    toast.info('Cambios descartados');
  }

  get doctorWithoutAddress(): boolean {
    return (
      this.user?.userType === 'DOCTOR' &&
      (!this.user?.address || this.user.address.trim() === '')
    );
  }
}
