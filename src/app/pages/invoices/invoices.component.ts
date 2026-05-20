import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { ClientService } from '../../core/services/client.service';
import { Invoice, InvoiceRequest } from '../../core/models/invoice.model';
import { Client } from '../../core/models/client.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit, OnDestroy {
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

  private loadSub?: Subscription;
  private saveSub?: Subscription;
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
    this.clientService.getAll().subscribe({
      next: (res) => this.clients = res?.clients ?? [],
      error: () => { }
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.saveSub?.unsubscribe();
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
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
    this.loading = true;
    this.loadSub?.unsubscribe();

    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('[Invoices] Safety timeout reached — forcing loading=false');
        this.loading = false;
      }
    }, 12000);

    const params: any = { page: this.currentPage, limit: 10 };
    if (this.statusFilter) params.status = this.statusFilter;

    this.loadSub = this.invoiceService.getAll(params).subscribe({
      next: (res) => {
        this.invoices = res?.invoices ?? [];
        this.totalPages = res?.pages ?? 1;
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      },
      error: (err) => {
        console.error('[Invoices] Load error:', err?.message || err);
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      }
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
        client: invoice.client?._id || '',
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
    this.saveSub?.unsubscribe();
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

    this.saveSub = obs.subscribe({
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
