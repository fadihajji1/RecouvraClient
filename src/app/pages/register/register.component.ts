import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="brand-icon">R+</div>
          <h1>Créer un compte</h1>
          <p>Rejoignez Recouvra+</p>
        </div>

        @if (error) {
          <div class="alert alert-error">{{ error }}</div>
        }
        @if (success) {
          <div class="alert alert-success">{{ success }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom</label>
              <input id="firstName" type="text" class="form-control" [(ngModel)]="form.firstName" name="firstName" required>
            </div>
            <div class="form-group">
              <label for="lastName">Nom</label>
              <input id="lastName" type="text" class="form-control" [(ngModel)]="form.lastName" name="lastName" required>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" class="form-control" [(ngModel)]="form.email" name="email"
                   placeholder="votre@email.com" required>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input id="password" type="password" class="form-control" [(ngModel)]="form.password" name="password"
                   placeholder="Min. 8 caractères" required>
          </div>

          <div class="form-group">
            <label for="role">Rôle</label>
            <select id="role" class="form-control" [(ngModel)]="form.role" name="role">
              <option value="agent">Agent</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" class="btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Création...' : "S'inscrire" }}
          </button>
        </form>

        <p class="auth-footer">
          Déjà un compte ? <a routerLink="/login">Se connecter</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: 20px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
        top: -100px;
        left: -100px;
        border-radius: 50%;
      }
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 40px;
      backdrop-filter: blur(16px);
      box-shadow: var(--shadow-lg);
      animation: fadeInUp 0.5s ease-out;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;

      .brand-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: var(--accent-gradient);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.1rem;
        color: white;
        margin-bottom: 16px;
      }

      h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
      p { color: var(--text-muted); font-size: 0.9rem; }
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--danger);
      font-size: 0.85rem;
      margin-bottom: 20px;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--success);
      font-size: 0.85rem;
      margin-bottom: 20px;
    }

    .btn-block {
      width: 100%;
      justify-content: center;
      padding: 12px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      color: var(--text-muted);
      font-size: 0.85rem;
      a { color: var(--accent-primary); font-weight: 600; }
    }
  `]
})
export class RegisterComponent {
  form = { firstName: '', lastName: '', email: '', password: '', role: 'agent' as const };
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.form).subscribe({
      next: () => {
        this.success = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.error || 'Erreur lors de la création';
      }
    });
  }
}
