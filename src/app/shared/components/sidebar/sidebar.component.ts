import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UpperCasePipe],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(
    public authService: AuthService,
    public sidebarStateService: SidebarStateService
  ) {}

  get roleInitial(): string {
    const role = this.authService.getRole();
    return role ? role[0].toUpperCase() : 'U';
  }

  get isCollapsed(): boolean {
    return this.sidebarStateService.isCollapsed();
  }

  toggleSidebar(): void {
    this.sidebarStateService.toggle();
  }

  get collapseButtonLabel(): string {
    return this.isCollapsed ? 'Déplier le menu' : 'Réduire le menu';
  }

  get collapseButtonIcon(): string {
    return this.isCollapsed ? '»' : '«';
  }
}
