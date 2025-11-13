import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { AsyncPipe, NgIf, KeyValuePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [AsyncPipe, NgIf, KeyValuePipe, TitleCasePipe],
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.css'],
})
export class DoctorDetailComponent {
  private route = inject(ActivatedRoute);
  private doctorService = inject(UserService);

  id = this.route.snapshot.paramMap.get('id')!;
  doctor$ = this.doctorService.getUserById(this.id);
}
