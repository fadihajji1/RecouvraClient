import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = true;

  private loadSub?: Subscription;
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Safety: force loading=false after 12s no matter what
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('[Users] Safety timeout reached — forcing loading=false');
        this.loading = false;
      }
    }, 12000);

    this.loadSub = this.userService.getAll().subscribe({
      next: (res: any) => {
        this.users = res?.users || res || [];
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      },
      error: (err) => {
        console.error('[Users] Load error:', err?.message || err);
        this.loading = false;
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
      }
    });
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
  }

  deleteUser(user: User): void {
    if (confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) {
      this.userService.delete(user._id).subscribe(() => {
        this.users = this.users.filter(u => u._id !== user._id);
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
