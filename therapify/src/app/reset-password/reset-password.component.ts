import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  token = '';
  success = false;
  error = '';

  form = this.fb.group({
    password: ['', Validators.required],
  });

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {
    if (this.form.invalid || !this.token) return;

    this.authService
      .resetPassword(this.token, this.form.value.password!)
      .subscribe({
        next: () => {
          this.success = true;
        },
        error: () => {
          this.error = 'Token inválido o expirado';
        },
      });
  }
}
