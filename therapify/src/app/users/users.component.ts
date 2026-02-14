import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';
import { AppointmentService } from '../services/appointments.service';
import { User } from '../../types/user';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  userService = inject(UserService);
  reviewsService = inject(ReviewsService);
  appointmentService = inject(AppointmentService);

  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.filteredUsers = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  filter(type: string) {
    this.filteredUsers =
      type === 'all'
        ? this.users
        : this.users.filter((u) => u.userType === type);
  }

  deleteUser(id: string) {
    const user = this.users.find((u) => u.id === id);
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
        onClick: () => {
          this.executeDeleteUser(id);
        },
      },
      cancel: {
        label: 'Cancelar',
      },
    });
  }

  private executeDeleteUser(id: string) {
    this.appointmentService.getMyAppointments().subscribe((apps) => {
      const toDelete = apps.filter(
        (a) => a.patientId === id || a.doctorId === id,
      );
      toDelete.forEach((a) =>
        this.appointmentService.deleteAppointment(a.id).subscribe(),
      );
    });

    this.reviewsService.getReviewsForUser(id).subscribe((revs) => {
      revs.forEach((r) => this.reviewsService.deleteReview(r.id).subscribe());
    });

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== id);
        this.filteredUsers = this.filteredUsers.filter((u) => u.id !== id);
        toast.success('Usuario y datos asociados eliminados.', {
          position: 'top-center',
        });
      },
      error: () =>
        toast.error('Error al eliminar usuario', {
          position: 'top-center',
        }),
    });
  }
}
