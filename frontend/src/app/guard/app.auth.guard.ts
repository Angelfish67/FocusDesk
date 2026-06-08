import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { map, take } from 'rxjs';

import { AppAuthService } from '../service/app.auth.service';

export const AppAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): MaybeAsync<GuardResult> => {
  return checkAccess(route, state);
};

export const AppAuthGuardChild: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): MaybeAsync<GuardResult> => {
  return checkAccess(childRoute, state);
};

async function checkAccess(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
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

  return new Promise<GuardResult>(resolve => {
    authService.hasAnyRole(requiredRoles)
      .pipe(
        take(1),
        map(hasRole => hasRole ? true : router.parseUrl('/noaccess'))
      )
      .subscribe(result => resolve(result));
  });
}