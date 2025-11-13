import { Component, input, output } from '@angular/core';
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
  navigate = output<string>();

  onClick() {
    this.navigate.emit(this.doctor().id);
  }
}
