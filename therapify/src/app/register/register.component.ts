import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';
import { toast } from 'ngx-sonner';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  step = 1;
  userType = '';

  loading = signal(false);
  accountCreated = signal(false);
  errorMsg = signal('');

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    userType: ['', Validators.required],
  });

  selectUserType(value: 'PACIENTE' | 'DOCTOR' | 'ADMIN') {
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
    if (this.loading()) return;

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const user = this.form.getRawValue() as any;

    this.userService
      .postUser(user)
      .pipe(
        timeout(30000),

        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.accountCreated.set(true);
          toast.success('¡Cuenta creada con éxito! Revisá tu correo para verificarla.');
        },
        error: (err) => {
          const msg = this.mensajeErrorRegistro(err);
          this.errorMsg.set(`❌ ${msg}`);
          toast.error(msg);
        },
      });
  }

  private mensajeErrorRegistro(err: any): string {
    if (err?.name === 'TimeoutError') {
      return 'El servidor está tardando demasiado. Intentá de nuevo.';
    }
    if (err?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisá tu conexión.';
    }

    const texto: string =
      err?.error?.message ??
      err?.error?.mensaje ??
      (typeof err?.error === 'string' ? err.error : '') ??
      '';

    const lower = texto.toLowerCase();
    if (
      lower.includes('email ya está registrado') ||
      lower.includes('ya está registrado') ||
      lower.includes('ya existe') ||
      lower.includes('duplicad') ||
      err?.status === 409
    ) {
      return 'Este email ya está registrado. Probá con otro.';
    }

    return texto || 'Error al crear la cuenta. Intentá nuevamente.';
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
