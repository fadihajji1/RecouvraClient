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
  templateUrl: './payments.component.html'
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
