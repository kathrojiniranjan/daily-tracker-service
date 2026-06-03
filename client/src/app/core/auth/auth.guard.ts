import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && !auth.isTokenExpired()) {
    return true;
  }

  // Stale or missing session — clear it so the UI reflects logged-out state.
  if (auth.isLoggedIn()) {
    auth.logout();
  }
  return router.createUrlTree(['/login']);
};
