import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../types/user';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);

  loading = false;
  showPassword = false;
  showRepeatPassword = false;

  user: User | null = null;

  formProfile: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    address: [''],
    gender: [''],
    password: [''],
    repeatPassword: [''],
  });

  getInitials(first?: string, last?: string): string {
    const f = first ? first.trim().charAt(0).toUpperCase() : '';
    const l = last ? last.trim().charAt(0).toUpperCase() : '';
    return f + l || 'U';
  }

  ngOnInit() {
    const loggedUser = this.userService.getLoggedUser();
    if (!loggedUser) {
      toast.warning('No hay sesión activa');
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(loggedUser.id).subscribe({
      next: (res) => {
        if (!res) return;
        this.user = res;

        this.formProfile.patchValue({
          firstName: res.firstName,
          lastName: res.lastName,
          address: res.address,
          gender: res.gender,
        });
        this.formProfile.markAsPristine();
      },
      error: () => toast.error('Error al cargar usuario'),
    });
  }

  onSubmitProfile() {
    if (this.formProfile.invalid) {
      Object.values(this.formProfile.controls).forEach((c: any) =>
        c.markAsTouched(),
      );
      return;
    }

    if (!this.user) return;

    const { firstName, lastName, address, gender, password, repeatPassword } =
      this.formProfile.getRawValue();

    if (password && password !== repeatPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const updatedUser: User = {
      ...this.user,
      firstName,
      lastName,
      address,
      gender,
      ...(password ? { password } : {}),
    };

    this.loading = true;

    this.userService.updateUser(updatedUser).subscribe({
      next: (res) => {
        this.loading = false;
        toast.success('Perfil actualizado correctamente');
        this.user = res;
        this.formProfile.patchValue({
          password: '',
          repeatPassword: '',
        });
        this.formProfile.markAsPristine();
      },
      error: () => {
        this.loading = false;
        toast.error('Error al actualizar el perfil');
      },
    });
  }

  cancel() {
    if (!this.user) return;

    this.formProfile.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      address: this.user.address,
      gender: this.user.gender,
      password: '',
      repeatPassword: '',
    });
    this.formProfile.markAsPristine();
  }
}
