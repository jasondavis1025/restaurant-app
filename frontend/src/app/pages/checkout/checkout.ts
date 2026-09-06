import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../shared/button/button';
import { AuthService } from '../../core/services/auth';
import { CreateOrderRequest } from '../../models/order.types';
import { OrderService } from '../../core/services/order';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, DatePipe, FormsModule, Button],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  readonly orderService = inject(OrderService);

  readonly pickupDates = this.createPickupDates();
  readonly selectedPickupDate = signal(this.pickupDates[0]);

  readonly isEditingContact = signal(true);
  readonly paymentExpanded = signal(true);
  readonly currentCustomer = computed(() => this.authService.currentCustomer());
  readonly name = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly taxRate = 0.0825;
  readonly tax = computed(() => this.cartService.subTotal() * this.taxRate);
  readonly total = computed(() => this.cartService.subTotal() + this.tax());

  readonly isSubmittingOrder = signal(false);
  readonly orderError = signal<string | null>(null);
  constructor() {
    if (this.cartService.cart().items.length === 0) {
      this.router.navigate(['/menu']);
      return;
    }
    const customer = this.currentCustomer();
    if (!customer) {
      return;
    }
    this.name.set(`${customer.firstName} ${customer.lastName}`);
    this.phone.set(customer.phone ?? '');
    this.email.set(customer.email);

    this.isEditingContact.set(false);
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

  placeOrder(): void {
    if (this.isSubmittingOrder()) {
      return;
    }

    this.orderError.set(null);

    const customerName = this.name().trim();
    const customerPhone = this.phone().trim();
    const customerEmail = this.email().trim();

    if (!customerName || !customerPhone || !customerEmail) {
      this.orderError.set('Please complete your contact information');
      this.isEditingContact.set(true);
      return;
    }

    this.isSubmittingOrder.set(true);

    const payload: CreateOrderRequest = {
      customerName,
      customerPhone,
      customerEmail,
      orderType: 'pickup',
      scheduledFor: this.selectedPickupDate().toISOString(),
      items: this.cartService.cart().items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        additionalInstructions: item.additionalInstructions,
        modifiers: item.customizations.map((customization) => ({
          customizationId: customization.id,
        })),
      })),
    };

    this.orderService.createOrder(payload).subscribe({
      next: (order) => {
        this.isSubmittingOrder.set(false);
        this.orderError.set(null);

        this.cartService.clearCart();
        this.router.navigate(['/confirmation', order.id], {
          queryParams: order.guestAccessToken ? { guestAccessToken: order.guestAccessToken } : {},
        });
      },
      error: (error) => {
        this.isSubmittingOrder.set(false);
        this.orderError.set(
          error.error?.message ?? 'Unable to place your order. Please try again.',
        );
      },
    });
  }
}
