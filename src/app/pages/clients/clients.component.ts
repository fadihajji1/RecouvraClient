import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { Client, ClientRequest } from '../../core/models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Clients</h1>
        <p class="subtitle">Gérez les informations de vos clients</p>
      </div>
      <button class="btn-primary" (click)="openModal()">+ Nouveau Client</button>
    </div>

    <div class="filters-bar">
      <input class="form-control" type="text" placeholder="🔍 Rechercher un client..." [(ngModel)]="searchTerm" (input)="filterClients()">
    </div>

    @if (loading) {
      <div class="loading-spinner"></div>
    } @else if (filteredClients.length === 0) {
      <div class="card empty-state">
        <div class="empty-icon">👥</div>
        <h3>Aucun client trouvé</h3>
        <p>Commencez par ajouter votre premier client</p>
      </div>
    } @else {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Entreprise</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (client of filteredClients; track client._id) {
              <tr>
                <td><strong style="color: var(--text-primary)">{{ client.firstName }} {{ client.lastName }}</strong></td>
                <td>{{ client.email }}</td>
                <td>{{ client.phone || '—' }}</td>
                <td>{{ client.company || '—' }}</td>
                <td>{{ formatDate(client.createdAt) }}</td>
                <td class="actions">
                  <button class="btn-icon" title="Modifier" (click)="openModal(client)">✏️</button>
                  <button class="btn-icon" title="Supprimer" (click)="deleteClient(client)">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Modal -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingClient ? 'Modifier' : 'Nouveau' }} Client</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="saveClient()">
            <div class="form-row">
              <div class="form-group">
                <label>Prénom</label>
                <input class="form-control" [(ngModel)]="form.firstName" name="fn" required>
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input class="form-control" [(ngModel)]="form.lastName" name="ln" required>
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input class="form-control" type="email" [(ngModel)]="form.email" name="email" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input class="form-control" [(ngModel)]="form.phone" name="phone">
              </div>
              <div class="form-group">
                <label>Entreprise</label>
                <input class="form-control" [(ngModel)]="form.company" name="company">
              </div>
            </div>
            <div class="form-group">
              <label>Adresse</label>
              <input class="form-control" [(ngModel)]="form.address" name="address">
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
