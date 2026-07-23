import { Component, inject } from '@angular/core';
import { Button } from '../../../shared/button/button';
import { ModalService } from '../../../core/services/modal';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-menu-item-modal',
  imports: [Button, CurrencyPipe],
  templateUrl: './menu-item-modal.html',
  styleUrl: './menu-item-modal.scss',
})
export class MenuItemModal {
  readonly modalService = inject(ModalService);

  closeModal(): void {
    this.modalService.close();
  }
  addToCart(): void {
    const item = this.modalService.selectedMenuItem();

    // if (!item) {
    //   return;
    // }
    console.log('Adding item to cart:', item);
    this.modalService.open('cart');
  }
}
