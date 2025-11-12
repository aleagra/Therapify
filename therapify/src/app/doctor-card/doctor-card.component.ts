import { Component, input } from '@angular/core';
import { User } from '../../types/user';
import { KeyValuePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-doctor-card',
  imports: [KeyValuePipe, TitleCasePipe],
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.css',
})
export class DoctorCardComponent {
  doctor = input.required<User>();
}
