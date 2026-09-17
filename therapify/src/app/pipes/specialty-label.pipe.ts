import { Pipe, PipeTransform } from '@angular/core';
import { SPECIALTY_LABELS } from '../../types/constants';

@Pipe({
  name: 'specialtyLabel',
  standalone: true,
  pure: true,
})
export class SpecialtyLabelPipe implements PipeTransform {
  transform(specialty?: string | null): string {
    if (!specialty) return 'Profesional';
    const normalized = specialty.toString().trim().toUpperCase();
    return SPECIALTY_LABELS[normalized] ?? specialty.replace(/_/g, ' ');
  }
}
