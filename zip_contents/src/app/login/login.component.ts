import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  loading = false;
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
        alert('Email o contraseña incorrectos');
      }
    });
  }

  logForm = effect(() => {});
}
