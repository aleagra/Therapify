export interface User {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  password: string;
  confirmPassword: string;
  userType: String;
}
