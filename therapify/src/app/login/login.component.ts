import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';
import { toast } from 'ngx-sonner';
import { finalize, timeout } from 'rxjs';

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

  loading = signal(false);
  showPassword = false;
  demoLoadingRole = signal<'DOCTOR' | 'PACIENTE' | null>(null);
  demoStatusMessage = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  getControl(name: string) {
    const control = this.form.get(name);
    if (!control) throw new Error(`No se encontró el control ${name}`);
    return control;
  }

  loginDemo(role: 'DOCTOR' | 'PACIENTE') {
    if (this.loading()) return;

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

    this.form.patchValue({
      email: credentials.email,
      password: credentials.password,
    });
    this.form.markAsDirty();

    this.loading.set(true);
    this.demoLoadingRole.set(role);
    this.demoStatusMessage.set(
      `Iniciando sesión como ${role === 'DOCTOR' ? 'Terapeuta' : 'Paciente'} (Demo)...`,
    );

    this.userService.login(credentials.email, credentials.password).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.demoLoadingRole.set(null);
        this.demoStatusMessage.set('');
        if (user) {
          toast.success(
            `¡Bienvenido! Sesión demo activa como ${role === 'DOCTOR' ? 'Terapeuta' : 'Paciente'}.`
          );
          this.router.navigate(['/home']);
        } else {
          toast.error('No se pudo autenticar la cuenta demo.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.demoLoadingRole.set(null);
        this.demoStatusMessage.set('');
        toast.error(this.mensajeErrorLogin(err));
      },
    });
  }


  private mensajeErrorLogin(err: any): string {
    if (err?.name === 'TimeoutError') {
      return 'El servidor está tardando demasiado. Intentá de nuevo.';
    }
    if (err?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisá tu conexión.';
    }

    const texto: string =
      err?.error?.message ?? err?.error?.mensaje ?? err?.error?.detail ?? '';

    if (texto.toLowerCase().includes('verific')) {
      return 'Tenés que verificar tu email antes de poder ingresar.';
    }
    if (err?.status === 401 || err?.status === 403) {
      return 'Email o contraseña incorrectos.';
    }
    return texto || 'No se pudo iniciar sesión. Intentá nuevamente.';
  }

  onSubmit() {

    if (this.loading()) return;

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);

    this.userService
      .login(email, password)
      .pipe(
        timeout(30000),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (user) => {
          if (user) {
            this.router.navigate(['/home']);
          } else {
            toast.error('Email o contraseña incorrectos');
          }
        },
        error: (err) => toast.error(this.mensajeErrorLogin(err)),
      });
  }

}
