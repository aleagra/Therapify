/**
 * Therapify opera en Argentina: las plantillas horarias de los profesionales y
 * los turnos guardados son hora local argentina, sin offset. El backend valida
 * contra THERAPIFY_TIMEZONE, asi que el frontend no puede usar el reloj del
 * navegador — un evaluador en otro huso veria un corte distinto al del servidor.
 */
export const BUSINESS_TIMEZONE = 'America/Argentina/Buenos_Aires';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * Un instante expresado como reloj de pared argentino: `YYYY-MM-DDTHH:mm`.
 * El formato es ordenable lexicograficamente, asi que alcanza con comparar
 * strings y no hace falta reconstruir Dates con offsets.
 */
export function businessClock(instant: number = Date.now()): string {
  const parts = formatter.formatToParts(new Date(instant));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Arma la misma clave comparable a partir de los campos que devuelve la API.
 * Normaliza la hora a HH:mm para que no importe si viene con segundos.
 */
export function businessClockKey(date: string, time: string): string {
  return `${date}T${time.slice(0, 5)}`;
}
