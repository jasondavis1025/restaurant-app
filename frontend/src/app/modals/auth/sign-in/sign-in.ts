import { Component, inject } from '@angular/core';
import { Button } from '../../../shared/button/button';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalService } from '../../../core/services/modal';

@Component({
  selector: 'app-sign-in',
  imports: [Button, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  readonly modalService = inject(ModalService);
  private readonly formBuilder = inject(FormBuilder);
  submitted = false;
  readonly signInForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
    password: ['', Validators.required],
  });
  openSignUp(event: Event): void {
    event.stopPropagation();
    this.modalService.open('sign-up');
  }
  signIn(): void {
    this.submitted = true;
    console.log('this.signInForm.invalid:', this.signInForm.invalid);
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const formData = this.signInForm.getRawValue();

    console.log(formData);
    // this.modalService.close();
  }
}
