import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../shared/button/button';
import { ModalService } from '../../core/services/modal';
import { faBagShopping } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth';
import { faUser } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Button, FontAwesomeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly faUtensils = faUtensils;
  readonly faUser = faUser;
  readonly faBagShopping = faBagShopping;
  readonly modalService = inject(ModalService);
  readonly authService = inject(AuthService);
  readonly accountMenuOpen = signal(false);

  toggleAccountMenu(): void {
    this.accountMenuOpen.update((open) => !open);
  }

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.authService.currentCustomer.set(null);
        this.accountMenuOpen.set(false);
      },
      error: (error) => {
        console.error('Unable to sign out', error);
      },
    });
  }
}
