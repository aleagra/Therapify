import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

import { RouterLink } from '@angular/router';

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

  success = false;
  loading = false;
  sentToEmail = '';
  resendSecondsLeft = 0;

  private resendTimer: ReturnType<typeof setInterval> | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get canResend(): boolean {
    return this.resendSecondsLeft <= 0;
  }

  get resendCountdownLabel(): string {
    const minutes = Math.floor(this.resendSecondsLeft / 60);
    const seconds = this.resendSecondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    const email = this.form.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.sentToEmail = email;
        this.startResendCooldown();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  resend() {
    if (!this.canResend || !this.sentToEmail) return;

    this.authService.forgotPassword(this.sentToEmail).subscribe({
      next: () => this.startResendCooldown(),
    });
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
