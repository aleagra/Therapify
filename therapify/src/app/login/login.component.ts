import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule, RouterLink],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  loading = false;
  showPassword = false;
  demoLoadingRole: 'DOCTOR' | 'PACIENTE' | null = null;
  demoStatusMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  isValid = computed(() => this.form.valid);

  getControl(name: string) {
    const control = this.form.get(name);
    if (!control) throw new Error(`No se encontró el control ${name}`);
    return control;
  }

  loginDemo(role: 'DOCTOR' | 'PACIENTE') {
    if (this.loading) return;

    const credentials = {
      DOCTOR: {
        email: 'demo.terapeuta@therapify.com',
        password: 'Demo1234',
      },
      PACIENTE: {
        email: 'demo.paciente@therapify.com',
        password: 'Demo1234',
      },
    }[role];

    // Autocompleta automáticamente los campos del formulario
    this.form.patchValue({
      email: credentials.email,
      password: credentials.password,
    });
    this.form.markAsDirty();

    this.loading = true;
    this.demoLoadingRole = role;
    this.demoStatusMessage = `Iniciando sesión como ${role === 'DOCTOR' ? 'Terapeuta' : 'Paciente'} (Demo)...`;

    this.userService.login(credentials.email, credentials.password).subscribe({
      next: (user) => {
        this.loading = false;
        this.demoLoadingRole = null;
        this.demoStatusMessage = '';
        if (user) {
          toast.success(
            `¡Bienvenido! Sesión demo activa como ${role === 'DOCTOR' ? 'Terapeuta' : 'Paciente'}.`
          );
          this.router.navigate(['/home']);
        } else {
          toast.error('No se pudo autenticar la cuenta demo.');
        }
      },
      error: () => {
        this.loading = false;
        this.demoLoadingRole = null;
        this.demoStatusMessage = '';
        toast.error('Error al conectar con el servidor.');
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading = true;

    this.userService.login(email, password).subscribe((user) => {
      this.loading = false;
      if (user) {
        this.router.navigate(['/home']);
      } else {
        toast.error('Email o contraseña incorrectos');
      }
    });
  }

  logForm = effect(() => {});
}
