import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datePart',
  standalone: true,
  pure: true,
})
export class DatePartPipe implements PipeTransform {
  transform(dateStr?: string | null, part: 'day' | 'month' | 'full' = 'day'): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const d = new Date(year, month, day);

    if (isNaN(d.getTime())) return dateStr;

    if (part === 'day') {
      return String(day);
    }
    if (part === 'month') {
      return d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase();
    }
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'long' });
  }
}
