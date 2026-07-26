import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../shared/button/button';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, DatePipe, FormsModule, Button],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  readonly pickupDates = this.createPickupDates();
  readonly selectedPickupDate = signal(this.pickupDates[0]);

  readonly isEditingContact = signal(true);
  readonly paymentExpanded = signal(true);

  readonly name = signal('');
  readonly phone = signal('');
  readonly email = signal('');

  readonly taxRate = 0.0825;

  readonly tax = computed(() => this.cartService.subTotal() * this.taxRate);

  readonly total = computed(() => this.cartService.subTotal() + this.tax());

  constructor() {
    if (this.cartService.cart().items.length === 0) {
      this.router.navigate(['./menu']);
    }
  }

  toggleContactEdit(): void {
    this.isEditingContact.update((editing) => !editing);
  }

  togglePayment(): void {
    this.paymentExpanded.update((expanded) => !expanded);
  }

  updatePickupDate(event: Event): void {
    const select = event.target as HTMLSelectElement;

    const selectedDate = this.pickupDates.find((date) => date.toISOString() === select.value);

    if (selectedDate) {
      this.selectedPickupDate.set(selectedDate);
    }
  }

  updateName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
  }

  updatePhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.phone.set(input.value);
  }

  updateEmail(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  private createPickupDates(): Date[] {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);

      return date;
    });
  }
}
