import { Component, inject } from '@angular/core';
import { User } from '../../types/user';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  loading = false;
  user: User | null = null;

  weekDays = [
    { label: 'Monday', control: 'monday' },
    { label: 'Tuesday', control: 'tuesday' },
    { label: 'Wednesday', control: 'wednesday' },
    { label: 'Thursday', control: 'thursday' },
    { label: 'Friday', control: 'friday' },
  ];

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    gender: ['', Validators.required],
    password: [''],
    repeatPassword: [''],
    monday: [false],
    tuesday: [false],
    wednesday: [false],
    thursday: [false],
    friday: [false],
    description: [''],
  });

  ngOnInit() {
    const loggedUser = this.userService.getLoggedUser();
    if (!loggedUser) {
      alert('No hay sesión activa');
      this.router.navigate(['/login']);
      return;
    }

    this.user = loggedUser;

    this.form.patchValue({
      firstName: loggedUser.firstName,
      lastName: loggedUser.lastName,
      address: loggedUser.address,
      gender: loggedUser.gender,
      ...(loggedUser.schedule || {}),
      description: loggedUser.description || '',
    });
  }

  // ✅ GUARDAR INFORMACIÓN GENERAL
  onSubmitProfile() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const { firstName, lastName, address, gender, password, repeatPassword } =
      this.form.getRawValue();

    if (password && password !== repeatPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!this.user) return;

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
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        alert('Error al actualizar el perfil ❌');
      },
    });
  }

  // ✅ GUARDAR HORARIOS Y DESCRIPCIÓN (solo médico)
  onSubmitMedical() {
    if (!this.user) return;

    const { monday, tuesday, wednesday, thursday, friday, description } =
      this.form.getRawValue();

    const updatedUser: User = {
      ...this.user,
      schedule: { monday, tuesday, wednesday, thursday, friday },
      description,
    };

    this.loading = true;

    this.userService.updateUser(updatedUser).subscribe({
      next: (res) => {
        this.loading = false;
        alert('Horario médico actualizado ✅');
        this.user = res;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        alert('Error al actualizar el horario ❌');
      },
    });
  }

  // ✅ RESETEAR FORMULARIO
  cancel() {
    if (!this.user) return;
    this.form.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      address: this.user.address,
      gender: this.user.gender,
      ...(this.user.schedule || {}),
      description: this.user.description || '',
    });
  }
}
