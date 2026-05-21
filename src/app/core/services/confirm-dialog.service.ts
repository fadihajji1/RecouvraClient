import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  tone: 'danger' | 'default';
}

const DEFAULT_STATE: ConfirmDialogState = {
  open: false,
  title: '',
  message: '',
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  showCancel: true,
  tone: 'default'
};

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private resolver?: (confirmed: boolean) => void;
  private stateSubject = new BehaviorSubject<ConfirmDialogState>(DEFAULT_STATE);

  state$ = this.stateSubject.asObservable();

  confirm(options: Partial<Omit<ConfirmDialogState, 'open'>>): Promise<boolean> {
    this.resolver?.(false);

    this.stateSubject.next({
      ...DEFAULT_STATE,
      ...options,
      open: true
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  close(confirmed: boolean): void {
    this.resolver?.(confirmed);
    this.resolver = undefined;
    this.stateSubject.next(DEFAULT_STATE);
  }
}
