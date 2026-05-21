import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { Client, ClientRequest } from '../../core/models/client.model';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = true;
  searchTerm = '';
  showModal = false;
  editingClient: Client | null = null;
  saving = false;
  form: ClientRequest = { firstName: '', lastName: '', email: '', phone: '', company: '', address: '' };

  private loadSub?: Subscription;
  private saveSub?: Subscription;
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private clientService: ClientService,
    private confirmDialog: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.saveSub?.unsubscribe();
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
  }

  loadClients(): void {
    this.loading = true;
    this.loadSub?.unsubscribe();

    // Safety: force loading=false after 12s no matter what
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('[Clients] Safety timeout reached — forcing loading=false');
        this.loading = false;
      }
    }, 12000);

    this.loadSub = this.clientService.getAll().subscribe({
      next: (res) => {
        this.clients = res?.clients ?? [];
        this.filteredClients = [...this.clients];
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      },
      error: (err) => {
        console.error('[Clients] Load error:', err?.message || err);
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      }
    });
  }

  filterClients(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(c =>
      `${c.firstName} ${c.lastName} ${c.email} ${c.company || ''}`.toLowerCase().includes(term)
    );
  }

  openModal(client?: Client): void {
    this.editingClient = client || null;
    this.form = client
      ? { firstName: client.firstName, lastName: client.lastName, email: client.email, phone: client.phone, company: client.company, address: client.address }
      : { firstName: '', lastName: '', email: '', phone: '', company: '', address: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingClient = null;
  }

  saveClient(): void {
    this.saving = true;
    this.saveSub?.unsubscribe();

    const obs = this.editingClient
      ? this.clientService.update(this.editingClient._id, this.form)
      : this.clientService.create(this.form);

    this.saveSub = obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadClients();
      },
      error: () => { this.saving = false; }
    });
  }

  async deleteClient(client: Client): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Supprimer le client',
      message: `Supprimer ${client.firstName} ${client.lastName} ?`,
      confirmText: 'Supprimer',
      tone: 'danger'
    });

    if (confirmed) {
      this.clientService.delete(client._id).subscribe(() => this.loadClients());
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
