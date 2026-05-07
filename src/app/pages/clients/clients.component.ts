import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { Client, ClientRequest } from '../../core/models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = true;
  searchTerm = '';
  showModal = false;
  editingClient: Client | null = null;
  saving = false;
  form: ClientRequest = { firstName: '', lastName: '', email: '', phone: '', company: '', address: '' };

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (res) => {
        this.clients = res.clients;
        this.filteredClients = [...this.clients];
        this.loading = false;
      },
      error: () => { this.loading = false; }
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
    const obs = this.editingClient
      ? this.clientService.update(this.editingClient._id, this.form)
      : this.clientService.create(this.form);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadClients();
      },
      error: () => { this.saving = false; }
    });
  }

  deleteClient(client: Client): void {
    if (confirm(`Supprimer ${client.firstName} ${client.lastName} ?`)) {
      this.clientService.delete(client._id).subscribe(() => this.loadClients());
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
