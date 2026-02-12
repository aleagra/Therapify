export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export const DAYS_OF_WEEK: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
};
