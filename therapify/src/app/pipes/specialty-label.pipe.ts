import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'specialtyLabel',
  standalone: true,
  pure: true,
})
export class SpecialtyLabelPipe implements PipeTransform {
  private static readonly SPECIALTY_MAP: Record<string, string> = {
    PSICOLOGIA_CLINICA: 'Psicología clínica',
    PSICOANALISIS: 'Psicoanálisis',
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

  transform(specialty?: string | null): string {
    if (!specialty) return 'Profesional';
    return SpecialtyLabelPipe.SPECIALTY_MAP[specialty] ?? specialty;
  }
}
