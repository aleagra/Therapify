export interface AppointmentRequest {
  doctorId: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
  notes?: string;
}
