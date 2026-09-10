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

export const SPECIALTY_LABELS: Record<string, string> = {
  PSICOLOGIA_CLINICA: 'Psicología clínica',
  TERAPIA_COGNITIVO_CONDUCTUAL: 'Terapia cognitivo-conductual',
  TERAPIA_DE_PAREJA: 'Terapia de pareja',
  TERAPIA_FAMILIAR: 'Terapia familiar',
  PSIQUIATRIA: 'Psiquiatría',
  NEUROPSICOLOGIA: 'Neuropsicología',
  PSICOLOGIA_INFANTIL: 'Psicología infantil',
  PSICOLOGIA_LABORAL: 'Psicología laboral',
  SEXOLOGIA: 'Sexología',
  TERAPIA_HUMANISTA: 'Terapia humanista',
};

export const PLATFORM_METRICS = {
  therapists: '500+',
  sessions: '10.000+',
  satisfaction: '100%',
  weeklySlots: '100+',
};
