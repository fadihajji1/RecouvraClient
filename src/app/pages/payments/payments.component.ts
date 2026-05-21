import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Payment, PaymentRequest } from '../../core/models/payment.model';
import { Invoice } from '../../core/models/invoice.model';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html'
})
export class PaymentsComponent implements OnInit, OnDestroy {
  payments: Payment[] = [];
  invoices: Invoice[] = [];
  loading = true;
  methodFilter = '';
  currentPage = 1;
  totalPages = 1;
  showModal = false;
  saving = false;
  form: PaymentRequest = { invoice: '', amount: 0, paymentMethod: 'bank_transfer', reference: '', notes: '' };

  private loadSub?: Subscription;
  private saveSub?: Subscription;
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private paymentService: PaymentService,
    private invoiceService: InvoiceService,
    private confirmDialog: ConfirmDialogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPayments();
    this.invoiceService.getAll({ limit: 100 }).subscribe({
      next: (res) => this.invoices = res?.invoices ?? [],
      error: () => { }
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.saveSub?.unsubscribe();
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
  }

  loadPayments(): void {
    this.loading = true;
    this.loadSub?.unsubscribe();

    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('[Payments] Safety timeout reached — forcing loading=false');
        this.loading = false;
      }
    }, 12000);

    const params: any = { page: this.currentPage, limit: 10 };
    if (this.methodFilter) params.paymentMethod = this.methodFilter;

    this.loadSub = this.paymentService.getAll(params).subscribe({
      next: (res) => {
        this.payments = res?.payments ?? [];
        this.totalPages = res?.pages ?? 1;
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      },
      error: (err) => {
        console.error('[Payments] Load error:', err?.message || err);
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      }
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
    this.saveSub?.unsubscribe();
    this.saveSub = this.paymentService.create(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadPayments();
      },
      error: () => { this.saving = false; }
    });
  }

  async deletePayment(p: Payment): Promise<void> {
    if (!this.authService.isAdmin()) {
      await this.confirmDialog.confirm({
        title: 'Action non autorisée',
        message: 'your not allowed, only admin can perform this action',
        confirmText: 'OK',
        showCancel: false
      });
      return;
    }

    const confirmed = await this.confirmDialog.confirm({
      title: 'Supprimer le paiement',
      message: 'Supprimer ce paiement ?',
      confirmText: 'Supprimer',
      tone: 'danger'
    });

    if (confirmed) {
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
