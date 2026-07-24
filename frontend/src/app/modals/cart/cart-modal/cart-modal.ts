import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-cart-modal',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.scss',
})
export class CartModal {
  readonly cartService = inject(CartService);
  readonly estimatedReadyTime = new Date(Date.now() + 30 * 60 * 1000);

  onQuantityChange(cartItemId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.cartService.updateQuantity(cartItemId, Number(select.value));
  }
}
