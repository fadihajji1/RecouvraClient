import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (res: any) => {
        this.users = res.users || res;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
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
