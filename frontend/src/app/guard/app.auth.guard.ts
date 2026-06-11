import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Router
} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AppAuthService } from '../service/app.auth.service';

export const AppAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): MaybeAsync<GuardResult> => {
  return checkAccess(route);
};

export const AppAuthGuardChild: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot
): MaybeAsync<GuardResult> => {
  return checkAccess(childRoute);
};

async function checkAccess(
  route: ActivatedRouteSnapshot
): Promise<GuardResult> {
  const authService = inject(AppAuthService);
  const router = inject(Router);

  await authService.initAuth();

  if (!authService.hasValidAccessToken()) {
    return router.parseUrl('/login');
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return firstValueFrom(
    authService.hasAnyRole(requiredRoles).pipe(
      take(1),
      map(hasRole => hasRole ? true : router.parseUrl('/noaccess'))
    )
  );
}