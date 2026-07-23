import { Component, input, inject } from '@angular/core';
import { MenuItem as MenuItemModel } from '../../../models/menu.types';
import { ModalService } from '../../../core/services/modal';

@Component({
  selector: 'app-cart-modal',
  imports: [],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.scss',
})
export class CartModal {}
