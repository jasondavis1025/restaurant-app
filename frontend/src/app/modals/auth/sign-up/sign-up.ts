import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Button } from '../../../shared/button/button';
import { ModalService } from '../../../core/services/modal';

@Component({
  selector: 'app-sign-up',
  imports: [Button, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  readonly modalService = inject(ModalService);
  private readonly formBuilder = inject(FormBuilder);
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
    console.log('this.signUpForm.invalid:', this.signUpForm.invalid);
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const formData = this.signUpForm.getRawValue();
    const payload = {
      ...formData,
      phone: formData.phone.replace(/\D/g, ''),
    };
    console.log(payload);
    // this.modalService.close();
  }
}
