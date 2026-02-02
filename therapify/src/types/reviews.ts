export interface Reviews {
  id: string;
  comment: string;
  value: number;
  date: string;
  patientId?: string;
  doctorId?: string;
  patientName?: string;
}
