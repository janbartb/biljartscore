import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { StatusService } from '../services/status.service';

export const authGuard: CanActivateFn = (route, state) => {
    const appData = inject(StatusService);
    if (appData.isNotLoggedIn()) {
        const router = inject(Router);
        const loginPath = router.parseUrl('/login');
        return new RedirectCommand(loginPath);
    }
    return true;
};
