export interface signUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthday: string;
  zipCode: string;
}
export interface AuthCustomer {
  userId: string;
  customerId: string;
  email: string;
  role: 'customer' | 'employee' | 'admin';
  firstName: string;
  lastName: string;
  phone: string | null;
  birthday: string;
  zipCode: string;
}
export interface SignInRequest {
  email: string;
  password: string;
}
