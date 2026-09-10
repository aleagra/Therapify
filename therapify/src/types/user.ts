export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  password: string;
  confirmPassword: string;
  userType: string;
  token?: string;
  gender?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  distanceKm?: number;
  specialty?: string;
  doctorSpecialty?: string;
  consultationPrice?: number;
  schedule?: Record<string, boolean>;
  availability?: Record<string, string[]>;
  description?: string;
  averageRating?: number | null;
  totalReviews?: number | null;
  availableSlotsCount?: number | null;
  nextAvailableDates?: string[] | null;
}

export type UserDetailDTO = User;

