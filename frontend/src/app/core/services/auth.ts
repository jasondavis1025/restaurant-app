import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { signUpRequest, AuthCustomer } from '../../models/auth.types';
import { environment } from '../../environments/environment';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly currentCustomer = signal<AuthCustomer | null>(null);
  readonly isAuthenticated = computed(() => this.currentCustomer() !== null);

  signUp(input: signUpRequest) {
    return this.http.post<AuthCustomer>(`${environment.apiUrl}/auth/signup`, input);
  }
}
