import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { CalendarComponent } from './calendar.component';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el honorario cuando el perfil tiene precio cargado, aunque llegue despues del primer render', () => {

    expect(component.hasPrice()).toBeFalse();
    expect(component.formattedPrice()).toBe('A consultar');

    fixture.componentRef.setInput('consultationPrice', 100000);
    fixture.detectChanges();

    expect(component.hasPrice()).toBeTrue();
    expect(component.formattedPrice()).toBe('$100.000');
  });
});
