export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface AppointmentFilterParams {
  filter?: 'UPCOMING' | 'PAST';
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'EXPIRED' | string;
  page?: number;
  size?: number;
}

