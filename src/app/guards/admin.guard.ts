import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { StatusService } from '../services/status.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const appData = inject(StatusService);
    if (appData.isBeheerder()) {
        return true;
    }
    const router = inject(Router);
    const redirPath = router.parseUrl('/onderhoud');
    return new RedirectCommand(redirPath);
};
