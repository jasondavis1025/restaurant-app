import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalHost } from './shared/modal-host/modal-host';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('client');
  private readonly authService = inject(AuthService);

  constructor() {
    this.authService.loadCurrentUser();
  }
}
