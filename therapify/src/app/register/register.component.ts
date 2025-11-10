import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  step = 1;
  form: FormGroup;
  userType = '';

  selectUserType(value: string) {
    this.userType = value;
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      companyName: [''],
      password: [''],
      confirmPassword: [''],
    });
  }

  nextStep() {
    if (this.step < 3) {
      this.step++;
    }
  }
}
