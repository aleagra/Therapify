import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slotEnd',
  standalone: true,
  pure: true,
})
export class SlotEndPipe implements PipeTransform {
  transform(hora?: string | null): string {
    if (!hora) return '—';
    const [h, m] = hora.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return hora;
    const endHour = (h + 1).toString().padStart(2, '0');
    const endMin = m.toString().padStart(2, '0');
    return `${hora} - ${endHour}:${endMin}`;
  }
}
