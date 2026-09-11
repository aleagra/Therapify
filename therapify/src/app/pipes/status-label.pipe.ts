import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true,
  pure: true,
})
export class StatusLabelPipe implements PipeTransform {
  private static readonly STATUS_MAP: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Completado',
    // El profesional nunca lo confirmo y paso la hora: no hubo sesion.
    EXPIRED: 'Vencido',
  };

  transform(status?: string | null): string {
    if (!status) return '';
    return StatusLabelPipe.STATUS_MAP[status] ?? status.toLowerCase();
  }
}
