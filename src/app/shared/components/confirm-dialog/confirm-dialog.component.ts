import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmDialog.state$ | async; as state) {
      @if (state.open) {
        <div class="confirm-overlay" (click)="confirmDialog.close(false)">
          <section
            class="confirm-dialog"
            role="dialog"
            aria-modal="true"
            [attr.aria-labelledby]="'confirm-title'"
            (click)="$event.stopPropagation()"
          >
            <div class="confirm-icon" [class.danger]="state.tone === 'danger'">!</div>
            <div class="confirm-content">
              <h2 id="confirm-title">{{ state.title }}</h2>
              <p>{{ state.message }}</p>
            </div>
            <div class="confirm-actions">
              @if (state.showCancel) {
                <button type="button" class="btn-secondary" (click)="confirmDialog.close(false)">
                  {{ state.cancelText }}
                </button>
              }
              <button
                type="button"
                [ngClass]="state.tone === 'danger' ? 'btn-danger' : 'btn-primary'"
                (click)="confirmDialog.close(true)"
              >
                {{ state.confirmText }}
              </button>
            </div>
          </section>
        </div>
      }
    }
  `
})
export class ConfirmDialogComponent {
  constructor(public confirmDialog: ConfirmDialogService) {}
}
