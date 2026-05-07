import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatisticsService } from '../../core/services/statistics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.statisticsService.getStatistics().subscribe({
      next: (res) => {
        this.stats = res.statistics;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
