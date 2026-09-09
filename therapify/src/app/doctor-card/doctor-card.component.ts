import { Component, inject, input, output } from '@angular/core';
import { User } from '../../types/user';
import { KeyValuePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DAY_LABELS, SPECIALTY_LABELS } from '../../types/constants';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [KeyValuePipe, CommonModule],
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

  get doctorPhoto(): string | null {
    const doc = this.doctor() as any;
    return doc?.photoUrl || doc?.avatarUrl || doc?.profileImage || null;
  }

  get specialtyFormatted(): string {
    const spec = this.doctor()?.specialty;
    if (!spec) return 'Profesional';
    const normalized = spec.toString().trim().toUpperCase();
    return SPECIALTY_LABELS[normalized] || spec.replace(/_/g, ' ');
  }

  get hasValidDistance(): boolean {
    const d = this.doctor()?.distanceKm;
    return typeof d === 'number' && !isNaN(d) && isFinite(d) && d >= 0;
  }

  formatDistance(dist: number | undefined | null): string {
    if (typeof dist !== 'number' || isNaN(dist)) return '';
    return `${dist.toFixed(1)} km`;
  }

  get avatarPalette(): { bg: string; color: string } {
    const name = `${this.doctor()?.firstName || ''}${this.doctor()?.lastName || ''}`;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const palettes = [
      { bg: 'var(--c-primary-100)', color: 'var(--c-primary-700)' },
      { bg: 'var(--c-accent-100)', color: 'var(--c-accent-700)' },
      { bg: '#e0f2fe', color: '#0369a1' },
      { bg: '#e8edf5', color: '#1e3a5f' },
    ];
    return palettes[Math.abs(hash) % palettes.length];
  }
}
