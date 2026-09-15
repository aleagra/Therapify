import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { finalize, timeout } from 'rxjs';

const RESEND_COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Signals para evitar desincronización de cambio de estado en Zone.js
  success = signal(false);
  loading = signal(false);
  resending = signal(false);
  sentToEmail = '';
  resendSecondsLeft = 0;

  private resendTimer: ReturnType<typeof setInterval> | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get canResend(): boolean {
    return this.resendSecondsLeft <= 0 && !this.resending();
  }

  get resendCountdownLabel(): string {
    const minutes = Math.floor(this.resendSecondsLeft / 60);
    const seconds = this.resendSecondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  submit() {
    if (this.loading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const email = this.form.value.email!;

    this.authService
      .forgotPassword(email)
      .pipe(
        timeout(30000),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.success.set(true);
          this.sentToEmail = email;
          this.startResendCooldown();
          toast.success('Enlace de recuperación enviado con éxito.');
        },
        error: (err) => {
          toast.error(this.mensajeError(err));
        },
      });
  }

  resend() {
    if (!this.canResend || !this.sentToEmail || this.resending()) return;

    this.resending.set(true);

    this.authService
      .forgotPassword(this.sentToEmail)
      .pipe(
        timeout(30000),
        finalize(() => this.resending.set(false)),
      )
      .subscribe({
        next: () => {
          this.startResendCooldown();
          toast.success('Enlace reenviado.');
        },
        error: (err) => {
          toast.error(this.mensajeError(err));
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

    return texto || 'No se pudo enviar el enlace de recuperación. Intentá nuevamente.';
  }

  private startResendCooldown(): void {
    this.resendSecondsLeft = RESEND_COOLDOWN_SECONDS;
    if (this.resendTimer) clearInterval(this.resendTimer);

    this.resendTimer = setInterval(() => {
      this.resendSecondsLeft -= 1;
      if (this.resendSecondsLeft <= 0 && this.resendTimer) {
        clearInterval(this.resendTimer);
        this.resendTimer = null;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.resendTimer) clearInterval(this.resendTimer);
  }
}
