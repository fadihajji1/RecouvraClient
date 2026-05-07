import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatisticsService } from '../../core/services/statistics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h1>Tableau de bord</h1>
        <p class="subtitle">Vue d'ensemble de votre activité de recouvrement</p>
      </div>
    </div>

    @if (loading) {
      <div class="loading-spinner"></div>
    } @else {
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ stats?.clients?.total || 0 }}</div>
          <div class="stat-label">Total Clients</div>
        </div>
        <div class="stat-card card-blue">
          <div class="stat-icon">📄</div>
          <div class="stat-value">{{ stats?.invoices?.total || 0 }}</div>
          <div class="stat-label">Factures</div>
        </div>
        <div class="stat-card card-orange">
          <div class="stat-icon">⚠️</div>
          <div class="stat-value">{{ stats?.overdueInvoices || 0 }}</div>
          <div class="stat-label">En retard</div>
        </div>
        <div class="stat-card card-green">
          <div class="stat-icon">💰</div>
          <div class="stat-value">{{ formatCurrency(stats?.invoices?.totalAmount || 0) }}</div>
          <div class="stat-label">Montant Total</div>
        </div>
      </div>

      <!-- Status Breakdown -->
      @if (stats?.invoices?.byStatus) {
        <div class="status-grid">
          @for (statusKey of getStatusKeys(); track statusKey) {
            <div class="status-item">
              <div class="status-bar" [style.width.%]="getStatusPercentage(statusKey)">
                <span class="badge" [class]="'badge-' + statusKey.toLowerCase()">{{ statusKey }}</span>
              </div>
              <div class="status-info">
                <span>{{ stats.invoices.byStatus[statusKey].count }} factures</span>
                <span class="amount">{{ formatCurrency(stats.invoices.byStatus[statusKey].amount) }}</span>
              </div>
            </div>
          }
        </div>
      }

      <div class="dashboard-grid">
        <!-- Recent Payments -->
        <div class="card dashboard-section">
          <div class="section-header">
            <h3>💳 Paiements récents</h3>
            <a routerLink="/payments" class="view-all">Voir tout →</a>
          </div>
          @if (stats?.recentPayments?.length) {
            <div class="list-items">
              @for (payment of stats.recentPayments; track payment._id) {
                <div class="list-item">
                  <div class="item-info">
                    <span class="item-title">{{ payment.invoice?.invoiceNumber || 'N/A' }}</span>
                    <span class="item-sub">{{ payment.createdBy?.firstName }} {{ payment.createdBy?.lastName }}</span>
                  </div>
                  <span class="item-amount success">+{{ formatCurrency(payment.amount) }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p>Aucun paiement récent</p>
            </div>
          }
        </div>

        <!-- Upcoming Actions -->
        <div class="card dashboard-section">
          <div class="section-header">
            <h3>⚡ Actions à venir</h3>
            <a routerLink="/recovery-actions" class="view-all">Voir tout →</a>
          </div>
          @if (stats?.upcomingActions?.length) {
            <div class="list-items">
              @for (action of stats.upcomingActions; track action._id) {
                <div class="list-item">
                  <div class="item-info">
                    <span class="item-title">{{ action.invoice?.invoiceNumber || 'N/A' }}</span>
                    <span class="item-sub">{{ action.performedBy?.firstName }} {{ action.performedBy?.lastName }} · {{ formatDate(action.actionDate) }}</span>
                  </div>
                  <span class="badge badge-planned">{{ action.actionType }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p>Aucune action planifiée</p>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card.card-blue::before { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
    .stat-card.card-orange::before { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    .stat-card.card-green::before { background: linear-gradient(135deg, #10b981, #34d399); }

    .status-grid {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-bar {
      min-width: 80px;
      display: flex;
      align-items: center;
    }

    .status-info {
      display: flex;
      justify-content: space-between;
      flex: 1;
      color: var(--text-secondary);
      font-size: 0.85rem;

      .amount { color: var(--text-primary); font-weight: 600; }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .dashboard-section {
      padding: 0;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 20px;
      border-bottom: 1px solid var(--border-color);

      h3 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .view-all {
        font-size: 0.8rem;
        color: var(--accent-primary);
        font-weight: 500;
      }
    }

    .list-items { padding: 4px 0; }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      transition: var(--transition);

      &:hover { background: rgba(99, 102, 241, 0.03); }
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-title {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .item-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .item-amount {
      font-weight: 700;
      font-size: 0.9rem;
      &.success { color: var(--success); }
    }

    .empty-state { padding: 30px 20px; }

    @media (max-width: 768px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
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
