import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/services/modal';
import { SignIn } from '../../modals/auth/sign-in/sign-in';
import { SignUp } from '../../modals/auth/sign-up/sign-up';
import { CartModal } from '../../modals/cart/cart-modal/cart-modal';
import { MenuItemModal } from '../../pages/menu/menu-item-modal/menu-item-modal';

@Component({
  selector: 'app-modal-host',
  imports: [SignIn, SignUp, CartModal, MenuItemModal],
  templateUrl: './modal-host.html',
  styleUrl: './modal-host.scss',
})
export class ModalHost {
  readonly modalService = inject(ModalService);
}
