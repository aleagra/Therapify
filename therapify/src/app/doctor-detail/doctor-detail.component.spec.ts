import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { DoctorDetailComponent } from './doctor-detail.component';
import { UserService } from '../services/user.service';

describe('DoctorDetailComponent', () => {
  let component: DoctorDetailComponent;
  let fixture: ComponentFixture<DoctorDetailComponent>;

  beforeEach(async () => {
    const mockUserService = {
      getUserById: () => of({
        id: '1',
        firstName: 'Ana',
        lastName: 'García',
        specialty: 'psicologia',
        address: 'Av. Santa Fe 1234',
        consultationPrice: 25000,
        description: 'Especialista en terapia cognitiva.',
        schedule: [],
        availability: {
          MONDAY: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
          TUESDAY: ['09:00', '10:00'],
          WEDNESDAY: ['15:00']
        }
      }),
      getLoggedUser: () => ({ id: '1', name: 'Paciente' }),
    };

    await TestBed.configureTestingModule({
      imports: [DoctorDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format dense hours as a range and sparse hours individually', () => {
    // 12 hours (dense) -> range
    const denseHours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    expect(component.formatScheduleRange(denseHours)).toBe('10:00 a 21:00 hs');

    // 2 hours -> list with bullets
    const sparseHours = ['09:00', '10:00'];
    expect(component.formatScheduleRange(sparseHours)).toBe('09:00 · 10:00 hs');

    // 1 hour
    expect(component.formatScheduleRange(['15:00'])).toBe('15:00 hs');

    // 0 hours
    expect(component.formatScheduleRange([])).toBe('');
  });
});
