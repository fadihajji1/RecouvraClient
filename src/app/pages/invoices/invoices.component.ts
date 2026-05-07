import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { ClientService } from '../../core/services/client.service';
import { Invoice, InvoiceRequest } from '../../core/models/invoice.model';
import { Client } from '../../core/models/client.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Factures</h1>
        <p class="subtitle">Gérez les factures et leur statut</p>
      </div>
      <button class="btn-primary" (click)="openModal()">+ Nouvelle Facture</button>
    </div>

    <div class="filters-bar">
      <select class="form-control" [(ngModel)]="statusFilter" (change)="loadInvoices()">
        <option value="">Tous les statuts</option>
        <option value="Draft">Brouillon</option>
        <option value="Sent">Envoyée</option>
        <option value="Paid">Payée</option>
        <option value="Cancelled">Annulée</option>
      </select>
    </div>

    @if (loading) {
      <div class="loading-spinner"></div>
    } @else if (invoices.length === 0) {
      <div class="card empty-state">
        <div class="empty-icon">📄</div>
        <h3>Aucune facture</h3>
        <p>Commencez par créer votre première facture</p>
      </div>
    } @else {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Échéance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (inv of invoices; track inv._id) {
              <tr>
                <td><strong style="color:var(--text-primary)">{{ inv.invoiceNumber }}</strong></td>
                <td>{{ inv.client?.firstName }} {{ inv.client?.lastName }}</td>
                <td style="color:var(--text-primary);font-weight:600">{{ formatCurrency(inv.totalAmount) }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + inv.status.toLowerCase()">{{ inv.status }}</span>
                </td>
                <td>{{ formatDate(inv.dueDate) }}</td>
                <td class="actions">
                  <button class="btn-icon" title="Modifier" (click)="openModal(inv)">✏️</button>
                  <button class="btn-icon" title="Supprimer" (click)="deleteInvoice(inv)">🗑️</button>
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

    <!-- Modal -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width:640px">
          <div class="modal-header">
            <h2>{{ editingInvoice ? 'Modifier' : 'Nouvelle' }} Facture</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveInvoice()">
            <div class="form-row">
              <div class="form-group">
                <label>N° Facture</label>
                <input class="form-control" [(ngModel)]="form.invoiceNumber" name="invNum" required placeholder="INV-2026-001">
              </div>
              <div class="form-group">
                <label>Client</label>
                <select class="form-control" [(ngModel)]="form.client" name="client" required>
                  <option value="">Sélectionner...</option>
                  @for (c of clients; track c._id) {
                    <option [value]="c._id">{{ c.firstName }} {{ c.lastName }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Échéance</label>
                <input class="form-control" type="date" [(ngModel)]="form.dueDate" name="due" required>
              </div>
              <div class="form-group">
                <label>Taux de taxe (%)</label>
                <input class="form-control" type="number" [(ngModel)]="form.taxRate" name="tax">
              </div>
            </div>

            @if (editingInvoice) {
              <div class="form-group">
                <label>Statut</label>
                <select class="form-control" [(ngModel)]="form.status" name="status">
                  <option value="Draft">Brouillon</option>
                  <option value="Sent">Envoyée</option>
                  <option value="Paid">Payée</option>
                  <option value="Cancelled">Annulée</option>
                </select>
              </div>
            }

            <!-- Items -->
            <div class="items-section">
              <div class="section-header" style="padding:0 0 12px 0;border:none">
                <label style="font-weight:600;color:var(--text-primary)">Articles</label>
                <button type="button" class="btn-secondary btn-sm" (click)="addItem()">+ Article</button>
              </div>
              @for (item of form.items; track $index) {
                <div class="item-row">
                  <input class="form-control" placeholder="Description" [(ngModel)]="item.description" [name]="'desc'+$index">
                  <input class="form-control" type="number" placeholder="Qté" [(ngModel)]="item.quantity" [name]="'qty'+$index" style="max-width:80px">
                  <input class="form-control" type="number" placeholder="Prix" [(ngModel)]="item.price" [name]="'price'+$index" style="max-width:100px">
                  <button type="button" class="btn-icon" (click)="removeItem($index)">✕</button>
                </div>
              }
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
  `,
  styles: [`
    .item-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    .items-section {
      margin-bottom: 16px;
      padding: 16px;
      background: var(--bg-glass);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  clients: Client[] = [];
  loading = true;
  statusFilter = '';
  currentPage = 1;
  totalPages = 1;
  showModal = false;
  editingInvoice: Invoice | null = null;
  saving = false;
  form: any = this.getEmptyForm();

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.clientService.getAll().subscribe(res => this.clients = res.clients);
  }

  getEmptyForm(): any {
    return {
      invoiceNumber: '',
      client: '',
      dueDate: '',
      taxRate: 20,
      status: 'Draft',
      items: [{ description: '', quantity: 1, price: 0 }]
    };
  }

  loadInvoices(): void {
    const params: any = { page: this.currentPage, limit: 10 };
    if (this.statusFilter) params.status = this.statusFilter;

    this.invoiceService.getAll(params).subscribe({
      next: (res) => {
        this.invoices = res.invoices;
        this.totalPages = res.pages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadInvoices();
  }

  openModal(invoice?: Invoice): void {
    this.editingInvoice = invoice || null;
    if (invoice) {
      this.form = {
        invoiceNumber: invoice.invoiceNumber,
        client: invoice.client._id,
        dueDate: invoice.dueDate.split('T')[0],
        taxRate: invoice.taxRate,
        status: invoice.status,
        items: invoice.items.map(i => ({ description: i.description, quantity: i.quantity, price: i.price }))
      };
    } else {
      this.form = this.getEmptyForm();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingInvoice = null;
  }

  addItem(): void {
    this.form.items.push({ description: '', quantity: 1, price: 0 });
  }

  removeItem(index: number): void {
    this.form.items.splice(index, 1);
  }

  saveInvoice(): void {
    this.saving = true;
    const data: InvoiceRequest = {
      invoiceNumber: this.form.invoiceNumber,
      client: this.form.client,
      dueDate: this.form.dueDate,
      taxRate: this.form.taxRate,
      status: this.form.status,
      items: this.form.items
    };

    const obs = this.editingInvoice
      ? this.invoiceService.update(this.editingInvoice._id, data)
      : this.invoiceService.create(data);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadInvoices();
      },
      error: () => { this.saving = false; }
    });
  }

  deleteInvoice(inv: Invoice): void {
    if (confirm(`Supprimer la facture ${inv.invoiceNumber} ?`)) {
      this.invoiceService.delete(inv._id).subscribe(() => this.loadInvoices());
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
