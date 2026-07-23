import { Component, input, inject } from '@angular/core';
import { MenuItem as MenuItemModel } from '../../../models/menu.types';
import { ModalService } from '../../../core/services/modal';

@Component({
  selector: 'app-menu-item',
  imports: [],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.scss',
})
export class MenuItem {
  readonly item = input.required<MenuItemModel>();

  private readonly modalService = inject(ModalService);

  openDetails(): void {
    console.log('openDetails()');
    this.modalService.openMenuItem(this.item());
  }
}
