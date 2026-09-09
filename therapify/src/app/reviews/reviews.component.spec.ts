import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ReviewsComponent } from './reviews.component';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;

  beforeEach(async () => {
    const mockUserService = {
      getLoggedUser: () => ({ id: '10', name: 'Paciente' })
    };

    const mockReviewsService = {
      getReviewsByDoctor: () => of([]),
      createReview: () => of({}),
      updateReview: () => of({}),
      deleteReview: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [ReviewsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: ReviewsService, useValue: mockReviewsService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate average rating correctly', () => {
    component.reviews = [];
    expect(component.averageRating).toBe(0);

    component.reviews = [
      { id: '1', comment: 'Muy bueno', value: 5, date: '2026-03-01', patientId: 'p1', doctorId: '1' },
      { id: '2', comment: 'Excelente profesional', value: 4, date: '2026-03-02', patientId: 'p2', doctorId: '1' },
    ];
    expect(component.averageRating).toBe(4.5);
  });

  it('should compute patient initials properly', () => {
    expect(component.getPatientInitials('Juan', 'Pérez')).toBe('JP');
    expect(component.getPatientInitials('', '')).toBe('P');
  });
});
