import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const user = userService.getLoggedUser();

  if (user && user.userType === 'administrador') {
    return true;
  }
  router.navigate(['/home']);
  return false;
};
