import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scheduleRange',
  standalone: true,
  pure: true,
})
export class ScheduleRangePipe implements PipeTransform {
  transform(hours?: string[] | null): string {
    if (!hours || !hours.length) return '';
    if (hours.length === 1) return `${hours[0]} hs`;
    if (hours.length <= 3) {
      return hours.join(' · ') + ' hs';
    }
    const sorted = [...hours].sort();
    return `${sorted[0]} a ${sorted[sorted.length - 1]} hs`;
  }
}
