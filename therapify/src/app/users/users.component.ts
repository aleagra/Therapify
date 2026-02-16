import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';
import { AppointmentService } from '../services/appointments.service';
import { User } from '../../types/user';
import { toast } from 'ngx-sonner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  userService = inject(UserService);
  reviewsService = inject(ReviewsService);
  appointmentService = inject(AppointmentService);

  users = signal<User[]>([]);
  loading = signal(true);

  searchText = signal('');
  selectedType = signal<'ALL' | 'ADMIN' | 'DOCTOR' | 'PACIENTE'>('ALL');

  filteredUsers = computed(() => {
    let filtered = [...this.users()];

    const search = this.searchText().toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search),
      );
    }

    if (this.selectedType() !== 'ALL') {
      filtered = filtered.filter((u) => u.userType === this.selectedType());
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setType(type: 'ALL' | 'ADMIN' | 'DOCTOR' | 'PACIENTE') {
    this.selectedType.set(type);
  }

  trackById(index: number, user: User) {
    return user.id;
  }

  deleteUser(id: string) {
    const user = this.users().find((u) => u.id === id);
    if (!user) return;

    if (user.userType === 'ADMIN') {
      toast.error('No puedes eliminar al administrador.', {
        position: 'top-center',
      });
      return;
    }

    toast('¿Seguro que quieres eliminar este usuario?', {
      position: 'top-center',
      action: {
        label: 'Eliminar',
        onClick: () => this.executeDeleteUser(id),
      },
      cancel: { label: 'Cancelar' },
    });
  }

  private executeDeleteUser(id: string) {
    this.userService.deleteUserCascade(id).subscribe({
      next: () => {
        this.users.set(this.users().filter((u) => u.id !== id));
        toast.success('Usuario y datos asociados eliminados.', {
          position: 'top-center',
        });
      },
      error: () =>
        toast.error('Error al eliminar usuario y sus datos', {
          position: 'top-center',
        }),
    });
  }
}
