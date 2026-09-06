import { Component, inject, signal } from '@angular/core';
import { Button } from '../../../shared/button/button';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalService } from '../../../core/services/modal';
import { AuthService } from '../../../core/services/auth';
@Component({
  selector: 'app-sign-in',
  imports: [Button, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private readonly router = inject(Router);
  readonly modalService = inject(ModalService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  submitted = false;
  readonly signInForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
    password: ['', Validators.required],
  });
  readonly signInError = signal<string | null>(null);

  openSignUp(event: Event): void {
    event.stopPropagation();
    this.modalService.open('sign-up');
  }

  signIn(): void {
    this.signInError.set(null);
    this.submitted = true;
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.signInForm.getRawValue();

    this.authService
      .signIn({
        email,
        password,
      })
      .subscribe({
        next: (customer) => {
          this.authService.currentCustomer.set(customer);

          if (this.modalService.authIntent() === 'checkout-flow') {
            this.modalService.close();
            this.modalService.resetAuthIntent();
            this.router.navigate(['/checkout']);
            return;
          }
          this.modalService.close();
        },
        error: (error) => {
          if (error.status === 401) {
            this.signInError.set('Invalid email or password.');
            return;
          }
          this.signInError.set('Unable to sign in. Please try again.');
        },
      });
  }

  continueAsGuest(): void {
    if (this.modalService.authIntent() === 'checkout-flow') {
      this.modalService.close();
      this.modalService.resetAuthIntent();
      this.router.navigate(['/checkout']);
    }
  }
}
