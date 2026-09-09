import { Component, inject, input, output } from '@angular/core';
import { User } from '../../types/user';
import { KeyValuePipe, TitleCasePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DAY_LABELS } from '../../types/constants';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [KeyValuePipe, TitleCasePipe, CommonModule],
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.css',
})
export class DoctorCardComponent {
  doctor = input.required<User>();
  navigate = output<string>();
  router = inject(Router);
  DAY_LABELS = DAY_LABELS;

  onClick() {
    this.navigate.emit(this.doctor().id);
  }

  goToReviews(doctorId: string) {
    this.router.navigate(['/reviews', doctorId]);
  }

  get hasAvailableDays(): boolean {
    const schedule = this.doctor()?.schedule;
    if (!schedule) return false;

    return Object.values(schedule).some((v) => v);
  }

  getDayLabel(day: string): string {
    return this.DAY_LABELS[day as keyof typeof this.DAY_LABELS] || day;
  }

  get initials(): string {
    const fn = this.doctor()?.firstName || '';
    const ln = this.doctor()?.lastName || '';
    const initial1 = fn.trim().charAt(0);
    const initial2 = ln.trim().charAt(0);
    return `${initial1}${initial2}`.toUpperCase() || 'P';
  }

  get specialtyFormatted(): string {
    const spec = this.doctor()?.specialty;
    if (!spec) return 'Profesional';
    return spec.replace(/_/g, ' ');
  }
}
