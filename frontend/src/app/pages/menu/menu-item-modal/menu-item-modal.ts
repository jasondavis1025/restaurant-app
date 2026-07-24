import { Component, computed, inject, signal } from '@angular/core';
import { Button } from '../../../shared/button/button';
import { ModalService } from '../../../core/services/modal';
import { CurrencyPipe } from '@angular/common';
import { MenuItemCustomization } from '../../../models/menu.types';
import { CartService } from '../../../core/services/cart';
import { CartItem } from '../../../models/cart.types';

@Component({
  selector: 'app-menu-item-modal',
  imports: [Button, CurrencyPipe],
  templateUrl: './menu-item-modal.html',
  styleUrl: './menu-item-modal.scss',
})
export class MenuItemModal {
  readonly modalService = inject(ModalService);
  readonly cartService = inject(CartService);

  readonly selectedCustomizations = signal<MenuItemCustomization[]>([]);
  readonly additionalInstructions = signal('');

  toggleCustomization(customization: MenuItemCustomization): void {
    const current = this.selectedCustomizations();
    const isSelected = current.some((selected) => selected.id === customization.id);
    if (isSelected) {
      this.selectedCustomizations.set(
        current.filter((selected) => selected.id !== customization.id),
      );
      return;
    }

    this.selectedCustomizations.set([...current, customization]);
  }
  updateInstructions(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.additionalInstructions.set(textarea.value);
  }
  closeModal(): void {
    this.modalService.close();
  }

  readonly totalPrice = computed(() => {
    const item = this.modalService.selectedMenuItem();
    if (!item) return 0;

    const customizationTotal = this.selectedCustomizations().reduce(
      (total, customization) => total + customization.priceAdjustment,
      0,
    );
    return item.basePrice + customizationTotal;
  });

  addToCart(): void {
    const item = this.modalService.selectedMenuItem();
    if (!item) return;
    console.log({
      item,
      customizations: this.selectedCustomizations(),
      additionalInstructions: this.additionalInstructions,
    });
    const customizedItem: CartItem = {
      cartItemId: crypto.randomUUID(),
      menuItemId: item.id,
      menuSlug: item.menuSlug,
      name: item.name,
      basePrice: item.basePrice,
      quantity: 1,
      customizations: this.selectedCustomizations(),
      additionalInstructions: this.additionalInstructions(),
      totalPrice: this.totalPrice(),
    };
    this.cartService.addItem(customizedItem);
    this.modalService.open('cart');
  }
}
