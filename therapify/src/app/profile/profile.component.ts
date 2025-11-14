import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { User } from '../../types/user';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  loading = false;
  user: User = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    schedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
    },
    availability: {},
  };

  weekDays: { label: string; control: WeekDay }[] = [
    { label: 'Monday', control: 'monday' },
    { label: 'Tuesday', control: 'tuesday' },
    { label: 'Wednesday', control: 'wednesday' },
    { label: 'Thursday', control: 'thursday' },
    { label: 'Friday', control: 'friday' },
  ];

  formProfile: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    gender: ['', Validators.required],
    password: [''],
    repeatPassword: [''],
  });

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

    // Traemos el usuario completo desde la base de datos
    this.userService.getUserById(loggedUser.id).subscribe({
      next: (res) => {
        if (!res) {
          alert('No se encontró el usuario');
          return;
        }

        // Aseguramos que todos los campos obligatorios tengan valor
        this.user = {
          id: res.id ?? '',
          email: res.email ?? '',
          userType: res.userType ?? '',
          password: res.password ?? '',
          confirmPassword: res.confirmPassword ?? '',

          firstName: res.firstName ?? '',
          lastName: res.lastName ?? '',
          address: res.address ?? '',
          gender: res.gender ?? '',
          description: res.description ?? '',
          schedule: res.schedule ?? undefined,
          availability: res.availability ?? undefined,
        };

        // Patch profile (después de que user esté definido)
        this.formProfile.patchValue({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          address: this.user.address,
          gender: this.user.gender,
        });

        // Patch schedule solo si es doctor
        if (this.user.userType === 'doctor') {
          this.patchScheduleForm();
        }

        // Suscripción para toggle de días
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
      error: (err) => {
        console.error(err);
        alert('Error al cargar usuario');
      },
    });
  }

  patchScheduleForm() {
    const schedulePatch: any = {};
    for (const day of this.weekDays) {
      const key = day.control;
      const isScheduled = this.user.schedule?.[key] ?? true;

      // Si no hay disponibilidad o tiene menos de 2 elementos, usar valores por defecto
      const dayAvailability = this.user.availability?.[key];
      const start = dayAvailability?.[0] ?? '08:00';
      const end = dayAvailability?.[dayAvailability.length - 1] ?? '17:00';

      schedulePatch[key] = isScheduled;
      schedulePatch[`${key}Start`] = start;
      schedulePatch[`${key}End`] = end;
    }
    schedulePatch.description = this.user.description ?? '';
    this.formSchedule.patchValue(schedulePatch);
  }

  onSubmitProfile() {
    if (this.formProfile.invalid) {
      Object.values(this.formProfile.controls).forEach((c: any) =>
        c.markAsTouched()
      );
      return;
    }

    const { firstName, lastName, address, gender, password, repeatPassword } =
      this.formProfile.getRawValue();

    if (password && password !== repeatPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const updatedUser: User = {
      ...this.user,
      firstName,
      lastName,
      address,
      gender,
      ...(password ? { password } : {}),
    };

    this.loading = true;

    this.userService.updateUser(updatedUser).subscribe({
      next: (res) => {
        this.loading = false;
        alert('Perfil actualizado correctamente ✅');
        this.user = res;
        this.formProfile.patchValue({
          firstName: res.firstName,
          lastName: res.lastName,
          address: res.address,
          gender: res.gender,
        });
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        alert('Error al actualizar el perfil ❌');
      },
    });
  }

  generateHourSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    if (!start || !end) return slots;
    const [startH] = start.split(':').map(Number);
    const [endH] = end.split(':').map(Number);
    for (let hour = startH; hour < endH; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  onSubmitMedical() {
    const f = this.formSchedule.getRawValue();
    const schedule: Record<WeekDay, boolean> = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
    };
    const availability: Record<WeekDay, string[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    for (const day of this.weekDays) {
      const key = day.control;
      if (f[key]) {
        const start = f[`${key}Start`] || '08:00';
        const end = f[`${key}End`] || '17:00';
        schedule[key] = true;
        availability[key] = this.generateHourSlots(start, end);
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
        alert('Horario médico actualizado correctamente ✅');
        this.user = res;
        this.patchScheduleForm(); // refresca inputs con los datos guardados
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        alert('Error al actualizar el horario ❌');
      },
    });
  }

  cancel() {
    this.formProfile.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      address: this.user.address,
      gender: this.user.gender,
      password: '',
      repeatPassword: '',
    });

    if (this.user.userType === 'doctor') {
      this.patchScheduleForm();
    }
  }
}
