import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecoveryActionService } from '../../core/services/recovery-action.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { RecoveryAction, RecoveryActionRequest } from '../../core/models/recovery-action.model';
import { Invoice } from '../../core/models/invoice.model';

@Component({
  selector: 'app-recovery-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recovery-actions.component.html'
})
export class RecoveryActionsComponent implements OnInit {
  actions: RecoveryAction[] = [];
  invoices: Invoice[] = [];
  loading = true;
  statusFilter = '';
  currentPage = 1;
  totalPages = 1;
  showModal = false;
  editingAction: RecoveryAction | null = null;
  saving = false;
  form: RecoveryActionRequest = { invoice: '', actionType: 'email', status: 'planned', notes: '' };

  constructor(
    private recoveryActionService: RecoveryActionService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadActions();
    this.invoiceService.getAll({ limit: 100 }).subscribe(res => this.invoices = res.invoices);
  }

  loadActions(): void {
    const params: any = { page: this.currentPage, limit: 10 };
    if (this.statusFilter) params.status = this.statusFilter;

    this.recoveryActionService.getAll(params).subscribe({
      next: (res) => {
        this.actions = res.actions;
        this.totalPages = res.pages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadActions();
  }

  openModal(action?: RecoveryAction): void {
    this.editingAction = action || null;
    if (action) {
      this.form = {
        invoice: action.invoice._id,
        actionType: action.actionType,
        status: action.status,
        actionDate: action.actionDate?.split('T')[0],
        nextActionDate: action.nextActionDate?.split('T')[0],
        notes: action.notes || '',
        result: action.result || ''
      };
    } else {
      this.form = { invoice: '', actionType: 'email', status: 'planned', notes: '' };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAction = null;
  }

  saveAction(): void {
    this.saving = true;
    const obs = this.editingAction
      ? this.recoveryActionService.update(this.editingAction._id, this.form)
      : this.recoveryActionService.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadActions();
      },
      error: () => { this.saving = false; }
    });
  }

  deleteAction(a: RecoveryAction): void {
    if (confirm('Supprimer cette action ?')) {
      this.recoveryActionService.delete(a._id).subscribe(() => this.loadActions());
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatType(t: string): string {
    const map: Record<string, string> = {
      email: 'Email', phone_call: 'Appel', meeting: 'Réunion',
      reminder: 'Rappel', legal_notice: 'Mise en demeure', other: 'Autre'
    };
    return map[t] || t;
  }

  formatStatus(s: string): string {
    const map: Record<string, string> = {
      planned: 'Planifiée', completed: 'Terminée', cancelled: 'Annulée'
    };
    return map[s] || s;
  }
}
