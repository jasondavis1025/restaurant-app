import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order';
import { CreatedOrder } from '../../models/order.types';
import { ModalService } from '../../core/services/modal';

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
  private readonly modalService = inject(ModalService);

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
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 401) {
          this.handleUnauthorized();
        }

        if (error.status === 404) {
          this.orderError.set('Order not found');
          return;
        }

        this.orderError.set('Unable to load your order.');
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  private async handleUnauthorized(): Promise<void> {
    const didNavigate = await this.router.navigate(['/']);

    if (didNavigate) {
      this.modalService.open('sign-in');
    }
  }

  returnToMenu(): void {
    this.router.navigate(['/menu']);
  }
}
