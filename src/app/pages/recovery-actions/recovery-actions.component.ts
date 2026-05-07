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
  template: `
    <div class="page-header">
      <div>
        <h1>Actions de Recouvrement</h1>
        <p class="subtitle">Suivez et planifiez les actions de recouvrement</p>
      </div>
      <button class="btn-primary" (click)="openModal()">+ Nouvelle Action</button>
    </div>

    <div class="filters-bar">
      <select class="form-control" [(ngModel)]="statusFilter" (change)="loadActions()">
        <option value="">Tous les statuts</option>
        <option value="planned">Planifiée</option>
        <option value="completed">Terminée</option>
        <option value="cancelled">Annulée</option>
      </select>
    </div>

    @if (loading) {
      <div class="loading-spinner"></div>
    } @else if (actions.length === 0) {
      <div class="card empty-state">
        <div class="empty-icon">⚡</div>
        <h3>Aucune action</h3>
        <p>Les actions de recouvrement apparaîtront ici</p>
      </div>
    } @else {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Facture</th>
              <th>Type</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Agent</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (a of actions; track a._id) {
              <tr>
                <td><strong style="color:var(--text-primary)">{{ a.invoice?.invoiceNumber || 'N/A' }}</strong></td>
                <td><span class="badge badge-sent">{{ formatType(a.actionType) }}</span></td>
                <td>{{ formatDate(a.actionDate) }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + a.status">{{ formatStatus(a.status) }}</span>
                </td>
                <td>{{ a.performedBy?.firstName || a.performedBy?.name || '' }} {{ a.performedBy?.lastName || '' }}</td>
                <td>{{ (a.notes || '').slice(0, 40) }}{{ (a.notes || '').length > 40 ? '...' : '' }}</td>
                <td class="actions">
                  <button class="btn-icon" title="Modifier" (click)="openModal(a)">✏️</button>
                  <button class="btn-icon" title="Supprimer" (click)="deleteAction(a)">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages > 1) {
        <div class="pagination">
          <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">← Préc</button>
          <span style="color:var(--text-secondary);font-size:0.85rem">Page {{ currentPage }} / {{ totalPages }}</span>
          <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)">Suiv →</button>
        </div>
      }
    }

    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingAction ? 'Modifier' : 'Nouvelle' }} Action</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveAction()">
            <div class="form-group">
              <label>Facture</label>
              <select class="form-control" [(ngModel)]="form.invoice" name="invoice" required [disabled]="!!editingAction">
                <option value="">Sélectionner une facture...</option>
                @for (inv of invoices; track inv._id) {
                  <option [value]="inv._id">{{ inv.invoiceNumber }}</option>
                }
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Type</label>
                <select class="form-control" [(ngModel)]="form.actionType" name="type" required>
                  <option value="email">Email</option>
                  <option value="phone_call">Appel</option>
                  <option value="meeting">Réunion</option>
                  <option value="reminder">Rappel</option>
                  <option value="legal_notice">Mise en demeure</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select class="form-control" [(ngModel)]="form.status" name="status">
                  <option value="planned">Planifiée</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date</label>
                <input class="form-control" type="date" [(ngModel)]="form.actionDate" name="date">
              </div>
              <div class="form-group">
                <label>Prochaine action</label>
                <input class="form-control" type="date" [(ngModel)]="form.nextActionDate" name="nextDate">
              </div>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea class="form-control" [(ngModel)]="form.notes" name="notes" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Résultat</label>
              <input class="form-control" [(ngModel)]="form.result" name="result">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn-primary" [disabled]="saving">
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
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
