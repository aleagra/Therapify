import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  step = 1;
  userType = '';

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    userType: ['', Validators.required],
  });

  selectUserType(value: 'paciente' | 'doctor' | 'administrador') {
    this.userType = value;
    this.form.patchValue({ userType: value });
  }

  nextStep() {
    if (this.step === 1) {
      const { firstName, lastName, email } = this.form.controls;
      if (firstName.invalid || lastName.invalid || email.invalid) {
        firstName.markAsTouched();
        lastName.markAsTouched();
        email.markAsTouched();
        return;
      }
    }

    if (this.step === 2) {
      const { password, confirmPassword } = this.form.controls;
      if (
        password.invalid ||
        confirmPassword.invalid ||
        password.value !== confirmPassword.value
      ) {
        password.markAsTouched();
        confirmPassword.markAsTouched();
        return;
      }
    }

    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const user = this.form.getRawValue() as any;
    this.userService.postUser(user).subscribe(() => {
      alert('usuario creado exitosamente.');
    });
  }

  getControl(name: string) {
    const control = this.form.get(name);
    if (!control) throw new Error(`No se encontró el control ${name}`);
    return control;
  }

  formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  isValid = computed(() => this.form.valid);

  logForm = effect(() => {});
}
