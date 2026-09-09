import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCardComponent } from './doctor-card.component';

describe('DoctorCardComponent', () => {
  let component: DoctorCardComponent;
  let fixture: ComponentFixture<DoctorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('doctor', {
      id: '1',
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@example.com',
      password: '',
      confirmPassword: '',
      userType: 'DOCTOR',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
