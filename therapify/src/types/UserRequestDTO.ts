export interface UserRequestDTO {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  description?: string;
  userType?: string;
  schedule?: Record<string, boolean>;
  availability?: Record<string, string[]>;
  specialty?: string;
  consultationPrice?: number;
}
