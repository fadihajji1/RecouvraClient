import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SidebarStateService } from '../core/services/sidebar-state.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  constructor(public sidebarStateService: SidebarStateService) {}

  get isSidebarCollapsed(): boolean {
    return this.sidebarStateService.isCollapsed();
  }
}
