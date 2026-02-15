import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { AsyncPipe, NgIf, KeyValuePipe, TitleCasePipe } from '@angular/common';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [AsyncPipe, KeyValuePipe, TitleCasePipe, CalendarComponent],
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.css'],
})
export class DoctorDetailComponent {
  private route = inject(ActivatedRoute);
  private doctorService = inject(UserService);

  id = this.route.snapshot.paramMap.get('id')!;
  doctor$ = this.doctorService.getUserById(this.id);

  specialtyLabels: Record<string, string> = {
    PSICOLOGIA_CLINICA: 'Psicología clínica',
    TERAPIA_COGNITIVO_CONDUCTUAL: 'Terapia cognitivo conductual',
    TERAPIA_DE_PAREJA: 'Terapia de pareja',
    TERAPIA_FAMILIAR: 'Terapia familiar',
    PSIQUIATRIA: 'Psiquiatría',
    NEUROPSICOLOGIA: 'Neuropsicología',
    PSICOLOGIA_INFANTIL: 'Psicología infantil',
    PSICOLOGIA_LABORAL: 'Psicología laboral',
    SEXOLOGIA: 'Sexología',
    TERAPIA_HUMANISTA: 'Terapia humanista',
  };
}
