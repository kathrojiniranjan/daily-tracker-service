import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Allows the route only when the current user has the "Admin" role.
 * Non-admins are bounced to /home (NOT /login — they ARE logged in, just
 * not authorised for this route).
 *
 * NOTE: This is a CLIENT-side check for UX only. The real enforcement lives
 * on the API (`[Authorize(Roles = "Admin")]`). Never trust a client guard
 * to protect data — anyone can edit JS in their browser.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.user()?.role === 'Admin') {
    return true;
  }
  return router.createUrlTree(['/home']);
};
