import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../../types/user';
import { NgFor, NgIf } from '@angular/common';
import { UserRequestDTO } from '../../types/UserRequestDTO';

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
    { label: 'Monday', control: 'monday' as WeekDay },
    { label: 'Tuesday', control: 'tuesday' as WeekDay },
    { label: 'Wednesday', control: 'wednesday' as WeekDay },
    { label: 'Thursday', control: 'thursday' as WeekDay },
    { label: 'Friday', control: 'friday' as WeekDay },
  ];

  formSchedule: FormGroup = this.fb.group({
    monday: [true],
    mondayStart: ['08:00'],
    mondayEnd: ['17:00'],
    tuesday: [true],
    tuesdayStart: ['08:00'],
    tuesdayEnd: ['17:00'],
    wednesday: [true],
    wednesdayStart: ['08:00'],
    wednesdayEnd: ['17:00'],
    thursday: [true],
    thursdayStart: ['08:00'],
    thursdayEnd: ['17:00'],
    friday: [true],
    fridayStart: ['08:00'],
    fridayEnd: ['17:00'],
    description: [''],
  });

  ngOnInit() {
    const loggedUser = this.userService.getLoggedUser();
    if (!loggedUser) {
      alert('No hay sesión activa');
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(loggedUser.id).subscribe({
      next: (res) => {
        if (!res) {
          alert('Error al cargar datos del usuario');
          return;
        }

        this.user = res;

        if (res.userType === 'DOCTOR') {
          this.patchScheduleForm();
        }

        this.weekDays.forEach((day) => {
          this.formSchedule
            .get(day.control)
            ?.valueChanges.subscribe((value) => {
              if (!value) {
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
      error: () => alert('Error al cargar datos del usuario'),
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

    const schedulePatch: any = {};

    for (const day of this.weekDays) {
      const key = day.control;
      const isEnabled = scheduleObj[key] ?? true;

      const dayAvailability = availabilityObj[key] ?? [];
      const start = dayAvailability[0] ?? '08:00';
      const end = dayAvailability[dayAvailability.length - 1] ?? '17:00';

      schedulePatch[key] = isEnabled;
      schedulePatch[`${key}Start`] = start;
      schedulePatch[`${key}End`] = end;
    }

    schedulePatch.description = this.user.description ?? '';
    this.formSchedule.patchValue(schedulePatch);
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
    if (!this.user || this.user.userType !== 'DOCTOR') return;

    const f = this.formSchedule.getRawValue();

    const schedule: { [key in WeekDay]: boolean } = {
      monday: f.monday,
      tuesday: f.tuesday,
      wednesday: f.wednesday,
      thursday: f.thursday,
      friday: f.friday,
    };

    const availability: { [key in WeekDay]: string[] } = {
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

    const updatedUser: UserRequestDTO = {
      description: f.description,
      schedule,
      availability,
    };

    this.loading = true;

    this.userService.updateUser(updatedUser).subscribe({
      next: (res) => {
        this.loading = false;
        alert('Horario médico actualizado correctamente');

        if ('token' in res && res.token) {
          this.user.token = res.token;
        }

        this.user.schedule = schedule;
        this.user.availability = availability;
        this.user.description = f.description;
        this.userService.updateLocalUser(this.user);
        this.patchScheduleForm();
      },
      error: () => {
        this.loading = false;
        alert('Error al actualizar horario');
      },
    });
  }

  cancelMedical() {
    if (!this.user || this.user.userType !== 'DOCTOR') return;

    this.patchScheduleForm();
    this.formSchedule.patchValue({
      description: this.user.description ?? '',
    });

    alert('Cambios descartados');
  }
}
