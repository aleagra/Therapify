import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AppointmentService } from './appointments.service';
import { environment } from '../../environments/environment';

describe('AppointmentsService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;
  const mineUrl = `${environment.baseUrl}/appointments/mine`;

  const setLoggedUser = (id: string) =>
    localStorage.setItem('userLogged', JSON.stringify({ id, token: `tok-${id}` }));

  beforeEach(() => {
    localStorage.removeItem('userLogged');
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('userLogged');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('pide turnos de nuevo al cambiar de usuario en vez de reusar el cache del anterior', () => {
    setLoggedUser('paciente-demo');
    service.getMyAppointments({ size: 100 }).subscribe();
    const reqPaciente = httpMock.expectOne((r) => r.url === mineUrl);
    reqPaciente.flush({ content: [{ id: 'ap-1' }] });

    setLoggedUser('terapeuta-demo');
    service.getMyAppointments({ size: 100 }).subscribe();
    const reqTerapeuta = httpMock.expectOne((r) => r.url === mineUrl);
    reqTerapeuta.flush({ content: [{ id: 'ap-2' }] });

    expect(reqPaciente.request).not.toBe(reqTerapeuta.request);
  });

  it('no repite el pedido al volver a navegar como el mismo usuario dentro de la sesion', () => {
    setLoggedUser('paciente-demo');
    service.getMyAppointments({ size: 100 }).subscribe();
    httpMock.expectOne((r) => r.url === mineUrl).flush({ content: [] });

    // Segunda "navegacion" del mismo usuario: no debe salir un segundo GET.
    service.getMyAppointments({ size: 100 }).subscribe();
    const pendingRequests = httpMock.match((r) => r.url === mineUrl);
    expect(pendingRequests.length).toBe(0);
  });
});
