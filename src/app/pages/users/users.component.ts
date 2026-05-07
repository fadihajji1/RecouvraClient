import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Utilisateurs</h1>
        <p class="subtitle">Gestion des comptes utilisateurs</p>
      </div>
    </div>

    @if (loading) {
      <div class="loading-spinner"></div>
    } @else if (users.length === 0) {
      <div class="card empty-state">
        <div class="empty-icon">🔑</div>
        <h3>Aucun utilisateur</h3>
      </div>
    } @else {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users; track user._id) {
              <tr>
                <td><strong style="color:var(--text-primary)">{{ user.firstName }} {{ user.lastName }}</strong></td>
                <td>{{ user.email }}</td>
                <td><span class="badge" [class]="'badge-' + user.role">{{ user.role }}</span></td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td class="actions">
                  <button class="btn-icon" title="Supprimer" (click)="deleteUser(user)">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (res: any) => {
        this.users = res.users || res;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
      this.userService.delete(user._id).subscribe(() => {
        this.users = this.users.filter(u => u._id !== user._id);
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
