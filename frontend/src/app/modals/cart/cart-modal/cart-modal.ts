import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CartItem } from '../../../models/cart.types';
import { ModalService } from '../../../core/services/modal';
import { Button } from '../../../shared/button/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-modal',
  imports: [CurrencyPipe, DatePipe, Button],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.scss',
})
export class CartModal {
  readonly cartService = inject(CartService);
  readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  readonly estimatedReadyTime = new Date(Date.now() + 30 * 60 * 1000);

  onQuantityChange(cartItemId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.cartService.updateQuantity(cartItemId, Number(select.value));
  }
  modifyItem(cartItem: CartItem): void {
    this.modalService.openCartItemEditor(cartItem, cartItem.menuItem);
  }
  checkout(): void {
    if (this.cartService.cart().items.length === 0) {
      return;
    }
    this.modalService.close();
    this.router.navigate(['/checkout']);
  }
}
