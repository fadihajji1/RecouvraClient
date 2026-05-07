import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <h2 class="page-title">{{ getPageTitle() }}</h2>
      </div>
      <div class="navbar-right">
        <span class="role-badge" [class]="'badge badge-' + authService.getRole()">
          {{ authService.getRole() }}
        </span>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: var(--sidebar-width);
      right: 0;
      height: var(--navbar-height);
      background: rgba(15, 15, 26, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 99;
    }

    .page-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .role-badge {
      text-transform: capitalize;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  getPageTitle(): string {
    const url = this.router.url;
    const titles: Record<string, string> = {
      '/dashboard': 'Tableau de bord',
      '/clients': 'Gestion des Clients',
      '/invoices': 'Gestion des Factures',
      '/payments': 'Gestion des Paiements',
      '/recovery-actions': 'Actions de Recouvrement',
      '/users': 'Gestion des Utilisateurs',
    };
    for (const [path, title] of Object.entries(titles)) {
      if (url.startsWith(path)) return title;
    }
    return 'Recouvra+';
  }
}
