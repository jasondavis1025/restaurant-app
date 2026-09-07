import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { signUpRequest, AuthCustomer, SignInRequest } from '../../models/auth.types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly currentCustomer = signal<AuthCustomer | null>(null);
  readonly isAuthenticated = computed(() => this.currentCustomer() !== null);

  signUp(input: signUpRequest) {
    return this.http.post<AuthCustomer>(`${environment.apiUrl}/auth/signup`, input, {
      withCredentials: true,
    });
  }
  signIn(input: SignInRequest) {
    return this.http.post<AuthCustomer>(`${environment.apiUrl}/auth/signin`, input, {
      withCredentials: true,
    });
  }
  getCurrentUser(): Observable<AuthCustomer> {
    return this.http.get<AuthCustomer>(`${environment.apiUrl}/auth/me`, { withCredentials: true });
  }
  loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (customer) => {
        this.currentCustomer.set(customer);
      },
      error: () => {
        this.currentCustomer.set(null);
      },
    });
  }

  signOut(): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/auth/signout`,
      {},
      { withCredentials: true },
    );
    //   .subscribe({
    //     next: () => {
    //       this.currentCustomer.set(null);
    //     },
    //     error: (error) => {
    //       console.error('Unable to sign out', error);
    //     },
    //   });
  }
}
