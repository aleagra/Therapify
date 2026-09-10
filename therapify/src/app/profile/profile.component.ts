import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../types/user';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { concat, of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SkeletonComponent],
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

  isLoading = signal(true);
  loadError = signal<string | null>(null);

  private skeletonShownTime: number | null = null;

  private readonly skeletonState = toSignal(
    toObservable(this.isLoading).pipe(
      switchMap((loading) => {
        if (loading) {
          this.skeletonShownTime = null;
          return concat(
            of({ displayLoading: true, showSkeleton: false }),
            timer(150).pipe(
              tap(() => {
                this.skeletonShownTime = Date.now();
              }),
              map(() => ({ displayLoading: true, showSkeleton: true })),
            ),
          );
        } else {
          if (this.skeletonShownTime !== null) {
            const elapsed = Date.now() - this.skeletonShownTime;
            const remaining = Math.max(0, 350 - elapsed);
            this.skeletonShownTime = null;
            if (remaining > 0) {
              return timer(remaining).pipe(
                map(() => ({ displayLoading: false, showSkeleton: false })),
              );
            }
          }
          this.skeletonShownTime = null;
          return of({ displayLoading: false, showSkeleton: false });
        }
      }),
    ),
    { initialValue: { displayLoading: true, showSkeleton: false } },
  );

  showSkeleton = computed(() => this.skeletonState().showSkeleton);
  displayLoading = computed(() => this.skeletonState().displayLoading);

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
    if (!this.userService.getLoggedUser()) {
      toast.warning('No hay sesión activa');
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile(): void {
    const loggedUser = this.userService.getLoggedUser();
    if (!loggedUser) return;

    this.isLoading.set(true);
    this.loadError.set(null);

    this.userService.getUserById(loggedUser.id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (!res) {
          this.loadError.set('No pudimos cargar tu perfil.');
          return;
        }
        this.user = res;

        this.formProfile.patchValue({
          firstName: res.firstName,
          lastName: res.lastName,
          address: res.address,
          gender: res.gender,
        });
        this.formProfile.markAsPristine();
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('No pudimos cargar tu perfil.');
      },
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
