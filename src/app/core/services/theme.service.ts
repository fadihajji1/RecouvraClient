import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeStorageKey = 'recouvra-theme';
  private readonly document = inject(DOCUMENT);

  private currentTheme: ThemeMode = 'light';

  initializeTheme(): void {
    const savedTheme = this.getStoredTheme();
    const preferredTheme = this.getPreferredTheme();
    this.currentTheme = savedTheme ?? preferredTheme;
    this.applyTheme(this.currentTheme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem(this.themeStorageKey, theme);
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  isLightMode(): boolean {
    return this.currentTheme === 'light';
  }

  getToggleLabel(): string {
    return this.isLightMode() ? 'Passer en mode sombre' : 'Passer en mode clair';
  }

  private applyTheme(theme: ThemeMode): void {
    this.document.documentElement.classList.toggle('light-theme', theme === 'light');
    this.document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    this.document.documentElement.style.colorScheme = theme;
  }

  private getStoredTheme(): ThemeMode | null {
    const storedTheme = localStorage.getItem(this.themeStorageKey);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  }

  private getPreferredTheme(): ThemeMode {
    return 'light';
  }
}
