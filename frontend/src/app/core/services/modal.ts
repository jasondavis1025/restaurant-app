import { Service, signal } from '@angular/core';
import type { ModalType } from '../../models/modals.types';
import type { MenuItem as MenuItemModel } from '../../models/menu.types';
import type { CartItem } from '../../models/cart.types';

@Service()
export class ModalService {
  readonly activeModal = signal<ModalType | null>(null);
  readonly selectedMenuItem = signal<MenuItemModel | null>(null);
  readonly editingCartItem = signal<CartItem | null>(null);

  openMenuItem(item: MenuItemModel) {
    this.selectedMenuItem.set(item);
    this.editingCartItem.set(null);
    this.activeModal.set('menu-item');
  }
  open(modal: ModalType): void {
    this.activeModal.set(modal);
  }

  close(): void {
    this.activeModal.set(null);
    this.selectedMenuItem.set(null);
    this.editingCartItem.set(null);
  }

  openCartItemEditor(cartItem: CartItem, menuItem: MenuItemModel): void {
    this.selectedMenuItem.set(menuItem);
    this.editingCartItem.set(cartItem);
    this.activeModal.set('menu-item');
  }
}
