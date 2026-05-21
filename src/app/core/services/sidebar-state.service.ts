import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  private readonly storageKey = 'recouvra-sidebar-collapsed';
  private collapsed = this.readStoredState();

  isCollapsed(): boolean {
    return this.collapsed;
  }

  toggle(): void {
    this.setCollapsed(!this.collapsed);
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsed = collapsed;
    localStorage.setItem(this.storageKey, String(collapsed));
  }

  private readStoredState(): boolean {
    return localStorage.getItem(this.storageKey) === 'true';
  }
}
