import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  email = '';
  password = '';
  error = '';
  loading = false;

  private loginSub?: Subscription;
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.loginSub?.unsubscribe();

    // Safety: force loading=false after 12s
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('[Login] Safety timeout reached — forcing loading=false');
        this.loading = false;
        this.error = 'La connexion a pris trop de temps. Réessayez.';
      }
    }, 12000);

    this.loginSub = this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
        this.error = err.error?.message || 'Erreur de connexion';
      }
    });
  }
}
