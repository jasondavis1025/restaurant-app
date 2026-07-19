import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../shared/button/button';
import { ModalService } from '../../core/services/modal';
import { faBagShopping } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Button, FontAwesomeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly faUtensils = faUtensils;
  readonly faBagShopping = faBagShopping;
  readonly modalService = inject(ModalService);
}
