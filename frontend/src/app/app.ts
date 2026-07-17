import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalHost } from './shared/modal-host/modal-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('client');
}
