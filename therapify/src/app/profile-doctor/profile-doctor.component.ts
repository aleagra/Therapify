import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../../types/user';
import { NgFor, NgIf } from '@angular/common';

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

@Component({
  selector: 'app-profile-doctor',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './profile-doctor.component.html',
  styleUrl: './profile-doctor.component.css',
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
        if (!res || res.userType !== 'doctor') {
          alert('Solo los doctores tienen acceso a esta sección');
          return;
        }

        this.user = res;
        this.patchScheduleForm();

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
                  { emitEvent: false }
                );
              }
            });
        });
      },
      error: () => alert('Error al cargar datos del doctor'),
    });
  }

  patchScheduleForm() {
    const schedulePatch: any = {};

    for (const day of this.weekDays) {
      const key = day.control;
      const isEnabled = this.user.schedule?.[key] ?? true;

      const availability = this.user.availability?.[key];
      const start = availability?.[0] ?? '08:00';
      const end = availability?.[availability.length - 1] ?? '17:00';

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
    const f = this.formSchedule.getRawValue();

    const schedule: any = {};
    const availability: any = {};

    for (const day of this.weekDays) {
      const key = day.control;
      if (f[key]) {
        schedule[key] = true;
        availability[key] = this.generateHourSlots(
          f[`${key}Start`],
          f[`${key}End`]
        );
      } else {
        schedule[key] = false;
        availability[key] = [];
      }
    }

    const updatedUser: User = {
      ...this.user,
      schedule,
      availability,
      description: f.description,
    };

    this.loading = true;

    this.userService.updateUser(updatedUser).subscribe({
      next: (res) => {
        this.loading = false;
        alert('Horario médico actualizado correctamente');
        this.user = res;
        this.patchScheduleForm();
      },
      error: () => {
        this.loading = false;
        alert('Error al actualizar horario');
      },
    });
  }

  cancelMedical() {
    if (!this.user || this.user.userType !== 'doctor') return;
    this.patchScheduleForm();
    this.formSchedule.patchValue({
      description: this.user.description ?? '',
    });

    alert('Cambios descartados');
  }
}
