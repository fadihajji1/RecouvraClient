import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeButtonLabel(): string {
    return this.themeService.getToggleLabel();
  }

  getThemeButtonIcon(): string {
    return this.themeService.isLightMode() ? '🌙' : '☀️';
  }
}
