import { Service, signal } from '@angular/core';
import type { ModalType } from '../models/modals.types';
import { MenuItem as MenuItemModel } from '../../models/menu.types';

@Service()
export class ModalService {
  readonly activeModal = signal<ModalType | null>(null);
  readonly selectedMenuItem = signal<MenuItemModel | null>(null);

  openMenuItem(item: MenuItemModel) {
    this.selectedMenuItem.set(item);
    this.activeModal.set('menu-item');
  }
  open(modal: ModalType): void {
    this.activeModal.set(modal);
  }

  close(): void {
    this.activeModal.set(null);
  }
}
