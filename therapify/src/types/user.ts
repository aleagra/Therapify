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
  address?: string;
  specialty?: string;
  schedule?: Record<string, boolean>;
  availability?: Record<string, string[]>;
  description?: string;
}
