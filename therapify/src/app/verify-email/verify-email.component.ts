import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
})
export class VerifyEmailComponent implements OnInit {
  loading = signal(true);
  success = signal(false);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('Token de verificación inválido o ausente.');
      return;
    }

    this.authService
      .verifyEmail(token)
      .pipe(
        timeout(30000),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.success.set(true);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          if (err?.name === 'TimeoutError') {
            this.errorMessage.set('El servidor tardó demasiado en responder. Probá recargar la página.');
            return;
          }
          if (err?.status === 0) {
            this.errorMessage.set('No se pudo conectar con el servidor. Revisá tu conexión.');
            return;
          }
          this.errorMessage.set(
            err.error?.message || 'El token es inválido o ya expiró. Solicitá uno nuevo.',
          );
        },
      });
  }
}
