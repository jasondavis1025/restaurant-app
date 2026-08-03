import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order';
import { CreatedOrder } from '../../models/order.types';

@Component({
  selector: 'app-confirmation',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss',
})
export class Confirmation {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  readonly order = signal<CreatedOrder | null>(null);
  readonly isLoading = signal(true);
  readonly orderError = signal<string | null>(null);

  constructor() {
    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (!orderId) {
      this.isLoading.set(false);
      this.orderError.set('Order ID is missing.');
      return;
    }

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: () => {
        this.orderError.set('Unable to load your order.');
        this.isLoading.set(false);
      },
    });
  }

  returnToMenu(): void {
    this.router.navigate(['/menu']);
  }
}
