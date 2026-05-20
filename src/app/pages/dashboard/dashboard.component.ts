import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatisticsService } from '../../core/services/statistics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: any = null;
  loading = true;

  private loadSub?: Subscription;
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    // Safety: force loading=false after 12s no matter what
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('[Dashboard] Safety timeout reached — forcing loading=false');
        this.loading = false;
      }
    }, 12000);

    this.loadSub = this.statisticsService.getStatistics().subscribe({
      next: (res) => {
        this.stats = res?.statistics ?? null;
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      },
      error: (err) => {
        console.error('[Dashboard] Load error:', err?.message || err);
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      }
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getStatusKeys(): string[] {
    return this.stats?.invoices?.byStatus ? Object.keys(this.stats.invoices.byStatus) : [];
  }

  getStatusPercentage(status: string): number {
    const total = this.stats?.invoices?.total || 1;
    const count = this.stats?.invoices?.byStatus?.[status]?.count || 0;
    return Math.max((count / total) * 100, 15);
  }
}
