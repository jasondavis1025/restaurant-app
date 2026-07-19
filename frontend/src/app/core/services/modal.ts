import { Service, signal } from '@angular/core';
import type { ModalType } from '../models/modals.types';

@Service()
export class ModalService {
  readonly activeModal = signal<ModalType>(null);

  open(modal: ModalType): void {
    this.activeModal.set(modal);
  }

  close(): void {
    this.activeModal.set(null);
  }
}
