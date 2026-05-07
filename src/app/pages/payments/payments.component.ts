import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Payment, PaymentRequest } from '../../core/models/payment.model';
import { Invoice } from '../../core/models/invoice.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Paiements</h1>
        <p class="subtitle">Enregistrez et suivez les paiements reçus</p>
      </div>
      <button class="btn-primary" (click)="openModal()">+ Nouveau Paiement</button>
    </div>

    <div class="filters-bar">
      <select class="form-control" [(ngModel)]="methodFilter" (change)="loadPayments()">
        <option value="">Toutes les méthodes</option>
        <option value="bank_transfer">Virement</option>
        <option value="check">Chèque</option>
        <option value="cash">Espèces</option>
        <option value="credit_card">Carte</option>
        <option value="other">Autre</option>
      </select>
    </div>

    @if (loading) {
      <div class="loading-spinner"></div>
    } @else if (payments.length === 0) {
      <div class="card empty-state">
        <div class="empty-icon">💳</div>
        <h3>Aucun paiement</h3>
        <p>Les paiements enregistrés apparaîtront ici</p>
      </div>
    } @else {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Facture</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Date</th>
              <th>Référence</th>
              <th>Par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of payments; track p._id) {
              <tr>
                <td><strong style="color:var(--text-primary)">{{ p.invoice?.invoiceNumber || 'N/A' }}</strong></td>
                <td style="color:var(--success);font-weight:600">{{ formatCurrency(p.amount) }}</td>
                <td><span class="badge badge-sent">{{ formatMethod(p.paymentMethod) }}</span></td>
                <td>{{ formatDate(p.paymentDate) }}</td>
                <td>{{ p.reference || '—' }}</td>
                <td>{{ p.createdBy?.firstName }} {{ p.createdBy?.lastName }}</td>
                <td class="actions">
                  <button class="btn-icon" title="Supprimer" (click)="deletePayment(p)">🗑️</button>
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
            <h2>Nouveau Paiement</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="savePayment()">
            <div class="form-group">
              <label>Facture</label>
              <select class="form-control" [(ngModel)]="form.invoice" name="invoice" required>
                <option value="">Sélectionner une facture...</option>
                @for (inv of invoices; track inv._id) {
                  <option [value]="inv._id">{{ inv.invoiceNumber }} — {{ formatCurrency(inv.totalAmount) }}</option>
                }
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Montant</label>
                <input class="form-control" type="number" [(ngModel)]="form.amount" name="amount" required min="0" step="0.01">
              </div>
              <div class="form-group">
                <label>Méthode</label>
                <select class="form-control" [(ngModel)]="form.paymentMethod" name="method" required>
                  <option value="bank_transfer">Virement</option>
                  <option value="check">Chèque</option>
                  <option value="cash">Espèces</option>
                  <option value="credit_card">Carte</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Référence</label>
              <input class="form-control" [(ngModel)]="form.reference" name="ref" placeholder="Ex: CHQ-12345">
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea class="form-control" [(ngModel)]="form.notes" name="notes" rows="2"></textarea>
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
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  invoices: Invoice[] = [];
  loading = true;
  methodFilter = '';
  currentPage = 1;
  totalPages = 1;
  showModal = false;
  saving = false;
  form: PaymentRequest = { invoice: '', amount: 0, paymentMethod: 'bank_transfer', reference: '', notes: '' };

  constructor(private paymentService: PaymentService, private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadPayments();
    this.invoiceService.getAll({ limit: 100 }).subscribe(res => this.invoices = res.invoices);
  }

  loadPayments(): void {
    const params: any = { page: this.currentPage, limit: 10 };
    if (this.methodFilter) params.paymentMethod = this.methodFilter;

    this.paymentService.getAll(params).subscribe({
      next: (res) => {
        this.payments = res.payments;
        this.totalPages = res.pages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadPayments();
  }

  openModal(): void {
    this.form = { invoice: '', amount: 0, paymentMethod: 'bank_transfer', reference: '', notes: '' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  savePayment(): void {
    this.saving = true;
    this.paymentService.create(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadPayments();
      },
      error: () => { this.saving = false; }
    });
  }

  deletePayment(p: Payment): void {
    if (confirm('Supprimer ce paiement ?')) {
      this.paymentService.delete(p._id).subscribe(() => this.loadPayments());
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatMethod(m: string): string {
    const map: Record<string, string> = {
      bank_transfer: 'Virement', check: 'Chèque', cash: 'Espèces', credit_card: 'Carte', other: 'Autre'
    };
    return map[m] || m;
  }
}
