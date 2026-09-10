import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { User } from '../../types/user';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { DAY_LABELS, SPECIALTY_LABELS } from '../../types/constants';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorCardComponent {
  doctor = input.required<User>();
  navigate = output<string>();
  router = inject(Router);
  userService = inject(UserService);
  DAY_LABELS = DAY_LABELS;

  get isUserAdmin(): boolean {
    return this.userService.getLoggedUser()?.userType === 'ADMIN';
  }

  private static detailChunkPrefetched = false;

  onClick() {
    this.navigate.emit(this.doctor().id);
  }

  /** Precarga el chunk y los datos del detalle del doctor antes de navegar. */
  prefetchDetail() {
    this.userService.prefetchUserById(this.doctor().id);
    if (!DoctorCardComponent.detailChunkPrefetched) {
      DoctorCardComponent.detailChunkPrefetched = true;
      import('../doctor-detail/doctor-detail.component');
    }
  }

  goToReviews(doctorId: string) {
    this.router.navigate(['/reviews', doctorId]);
  }

  get hasAvailableDays(): boolean {
    return this.isAvailable;
  }

  get isAvailable(): boolean {
    if (this.availableSlotsCount !== null && this.availableSlotsCount !== undefined) {
      return this.availableSlotsCount > 0;
    }
    return this.attendingDays.length > 0;
  }

  get nextAvailableDateFormatted(): string | null {
    const dates = this.nextAvailableDates;
    if (!dates || dates.length === 0) return null;
    return this.formatNextDate(dates[0]);
  }

  get attendingDays(): string[] {
    const doc = this.doctor();
    if (!doc) return [];

    const shortLabels: Record<string, string> = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom',
    };

    let schedule: any = doc.schedule;
    if (typeof schedule === 'string') {
      try {
        schedule = JSON.parse(schedule);
      } catch {
        schedule = undefined;
      }
    }

    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    if (schedule && typeof schedule === 'object') {
      const active = dayKeys.filter((k) => !!schedule[k]);
      if (active.length > 0) {
        return active.map((k) => shortLabels[k] || this.getDayLabel(k));
      }
    }

    let availability: any = doc.availability;
    if (typeof availability === 'string') {
      try {
        availability = JSON.parse(availability);
      } catch {
        availability = undefined;
      }
    }
    if (availability && typeof availability === 'object') {
      const active = dayKeys.filter((k) => {
        const slots = availability[k];
        return Array.isArray(slots) && slots.length > 0;
      });
      if (active.length > 0) {
        return active.map((k) => shortLabels[k] || this.getDayLabel(k));
      }
    }

    return [];
  }

  readonly MAX_VISIBLE_DAYS = 3;

  get visibleAttendingDays(): string[] {
    return this.attendingDays.slice(0, this.MAX_VISIBLE_DAYS);
  }

  get remainingAttendingDaysCount(): number {
    return Math.max(0, this.attendingDays.length - this.MAX_VISIBLE_DAYS);
  }

  get doctorRating(): number | null {
    const r = this.doctor()?.averageRating ?? (this.doctor() as any)?.rating;
    if (r !== undefined && r !== null && !isNaN(Number(r))) {
      return Number(r);
    }
    return null;
  }

  get totalReviews(): number {
    return this.doctor()?.totalReviews ?? 0;
  }

  get availableSlotsCount(): number | null {
    const c = this.doctor()?.availableSlotsCount;
    return c !== undefined && c !== null ? Number(c) : null;
  }

  get nextAvailableDates(): string[] {
    return this.doctor()?.nextAvailableDates ?? [];
  }

  formatNextDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).replace('.', '');
      }
      return dateStr;
    } catch {
      return dateStr;
    }
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
    const spec = this.doctor()?.doctorSpecialty || this.doctor()?.specialty;
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
