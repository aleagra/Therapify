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

export const SPECIALTY_OPTIONS: { value: string; label: string }[] = [
  { value: 'PSICOLOGIA_CLINICA', label: 'Psicología clínica' },
  { value: 'TERAPIA_COGNITIVO_CONDUCTUAL', label: 'Terapia cognitivo-conductual' },
  { value: 'TERAPIA_DE_PAREJA', label: 'Terapia de pareja' },
  { value: 'TERAPIA_FAMILIAR', label: 'Terapia familiar' },
  { value: 'PSIQUIATRIA', label: 'Psiquiatría' },
  { value: 'NEUROPSICOLOGIA', label: 'Neuropsicología' },
  { value: 'PSICOLOGIA_INFANTIL', label: 'Psicología infantil' },
  { value: 'PSICOLOGIA_LABORAL', label: 'Psicología laboral' },
  { value: 'SEXOLOGIA', label: 'Sexología' },
  { value: 'TERAPIA_HUMANISTA', label: 'Terapia humanista' },
];

export const PLATFORM_METRICS = {
  therapists: '500+',
  sessions: '10.000+',
  satisfaction: '100%',
  weeklySlots: '100+',
};
