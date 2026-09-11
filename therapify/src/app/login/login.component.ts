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

  // Signals en vez de campos planos: la respuesta HTTP a veces llega en un
  // tick que zone.js no detecta como "inestable" y la vista no se
  // re-renderiza con un campo comun, dejando el boton trabado en
  // "Iniciando sesion...". El grafo de reactividad de los signals no
  // depende de esa deteccion de zona para programar el re-render.
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

    // Autocompleta automáticamente los campos del formulario
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

  /**
   * El backend usa 403 tanto para credenciales invalidas como para cuenta sin
   * verificar, y el texto es lo unico que las separa. Colapsarlas en
   * "contrasena incorrecta" hace que alguien con la clave correcta la cambie
   * una y otra vez sin entender por que no entra.
   */
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
    // Sin esta guarda cada click dispara otra request y el estado de `loading`
    // queda a merced de cual responda ultima.
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
        // Cota superior: si la request queda colgada, el boton tiene que poder
        // salir del estado de carga en vez de quedarse en "Iniciando sesion..."
        // para siempre.
        timeout(30000),
        // finalize corre pase lo que pase — exito, error o unsubscribe — asi que
        // el boton no puede quedar trabado por un camino que no contemplamos.
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
