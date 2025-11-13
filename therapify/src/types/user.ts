export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  password: string;
  confirmPassword: string;
  userType: string;
  gender?: string;
  address?: string;

  // Días que atiende
  schedule?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
  };

  // NUEVO — Horas disponibles por día (formato "HH:mm")
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
  };

  description?: string;
}
