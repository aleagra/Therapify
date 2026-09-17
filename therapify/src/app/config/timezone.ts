
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


export function businessClock(instant: number = Date.now()): string {
  const parts = formatter.formatToParts(new Date(instant));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function businessClockKey(date: string, time: string): string {
  return `${date}T${time.slice(0, 5)}`;
}
