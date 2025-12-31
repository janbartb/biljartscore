import { inject } from '@angular/core';
import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';
import { StatusService } from '../services/status.service';

export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
    const appData = inject(StatusService);
    if (appData.isNotLoggedIn()) {
        const router = inject(Router);
        const loginPath = router.parseUrl('/login');
        return new RedirectCommand(loginPath);
    }
    return true;
};
