/**
 * Traduccion de los errores de turnos que devuelve el backend.
 *
 * El motivo viaja en `code` (enum AppointmentErrorCode). El texto plano viene
 * en `mensaje` para InvalidAppointmentException/AppointmentConflictException,
 * pero en `message` para AccessDeniedException: hay que mirar los dos, y leer
 * la clave equivocada fue justamente lo que tapo errores reales detras de
 * mensajes genericos.
 */
export type AppointmentAction = 'reservar' | 'reprogramar' | 'cancelar';

const CODE_MESSAGES: Record<string, string> = {
  SLOT_TAKEN: 'Ese horario ya fue tomado. Elegí otro.',
  SLOT_IN_PAST: 'Ese horario ya pasó. Elegí uno posterior.',
  SLOT_NOT_IN_SCHEDULE: 'El profesional no atiende en ese horario.',
  SAME_SLOT: 'Elegí un horario distinto al actual.',
  APPOINTMENT_COMPLETED: 'Este turno ya se realizó y no admite cambios.',
  APPOINTMENT_EXPIRED: 'Este turno venció sin confirmarse y no admite cambios.',
  RESCHEDULE_WINDOW_EXPIRED:
    'Solo se puede reprogramar con más de 24 h de anticipación.',
  RESCHEDULE_LIMIT_REACHED:
    'Este turno ya alcanzó el máximo de reprogramaciones permitidas.',
  DOCTOR_CHANGE_NOT_ALLOWED:
    'No se puede cambiar de profesional al reprogramar.',
  INVALID_STATUS_TRANSITION: 'Ese cambio de estado no está permitido.',
  INVALID_STATUS: 'El estado enviado no es válido.',
  INVALID_TIME_RANGE: 'El horario elegido no es válido.',
};

export function appointmentErrorMessage(
  err: any,
  accion: AppointmentAction,
): string {
  const byCode = CODE_MESSAGES[err?.error?.code];
  if (byCode) return byCode;

  if (err?.error?.mensaje) return err.error.mensaje;
  if (err?.error?.message) return err.error.message;

  if (err?.status === 0) {
    return 'No se pudo conectar con el servidor. Revisá tu conexión.';
  }
  if (err?.status === 403) {
    return `No tenés permiso para ${accion} este turno.`;
  }
  return `No se pudo ${accion} el turno. Intentá nuevamente.`;
}
