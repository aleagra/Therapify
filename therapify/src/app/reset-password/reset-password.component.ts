import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  token = '';
  loading = signal(false);
  success = signal(false);
  error = signal('');

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error.set('Enlace inválido o sin token de verificación.');
    }
  }

  submit() {
    if (this.loading()) return;

    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService
      .resetPassword(this.token, this.form.value.password!)
      .pipe(
        timeout(30000),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.success.set(true);
          toast.success('Contraseña actualizada con éxito');
        },
        error: (err) => {
          const msg = this.mensajeError(err);
          this.error.set(msg);
          toast.error(msg);
        },
      });
  }

  private mensajeError(err: any): string {
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

    return texto || 'El token es inválido o ha expirado. Solicitá uno nuevo.';
  }
}
