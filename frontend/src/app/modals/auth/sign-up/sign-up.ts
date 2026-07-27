import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Button } from '../../../shared/button/button';
import { ModalService } from '../../../core/services/modal';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [Button, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  readonly modalService = inject(ModalService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly signUpError = signal<string | null>(null);

  submitted = false;
  readonly signUpForm = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
      ],
    ],
    phone: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
    birthday: ['', Validators.required],
    termsAccepted: [false, Validators.requiredTrue],
  });

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits})`;
    }

    this.signUpForm.controls.phone.setValue(formatted, {
      emitEvent: false,
    });
  }

  get passwordValue(): string {
    return this.signUpForm.controls.password.value;
  }

  join(): void {
    this.submitted = true;
    this.signUpError.set(null);
    console.log('this.signUpForm.invalid:', this.signUpForm.invalid);

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password, phone, birthday, zipCode } =
      this.signUpForm.getRawValue();

    this.authService
      .signUp({
        firstName,
        lastName,
        email,
        password,
        phone: phone.replace(/\D/g, ''),
        birthday,
        zipCode,
      })
      .subscribe({
        next: (customer) => {
          console.log('Account created:', customer);
          this.authService.currentCustomer.set(customer);

          if (this.modalService.authIntent() === 'checkout-flow') {
            this.modalService.close();
            this.router.navigate(['/checkout']);
            return;
          }
          this.modalService.close();
        },
        error: (error) => {
          console.error('Signup failed:', error);
          if (error.status === 409) {
            this.signUpError.set('An accout with that email already exists.');
            return;
          }

          this.signUpError.set('Unable to create your account. Please try again.');
        },
      });
  }
}
