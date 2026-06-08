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
  return checkAccess(route);
};

export const AppAuthGuardChild: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): MaybeAsync<GuardResult> => {
  return checkAccess(childRoute);
};

function checkAccess(route: ActivatedRouteSnapshot): MaybeAsync<GuardResult> {
  const authService = inject(AppAuthService);
  const router = inject(Router);

  if (!authService.hasValidAccessToken()) {
    return router.parseUrl('/noaccess');
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return authService.hasAnyRole(requiredRoles).pipe(
    take(1),
    map(hasRole => {
      if (!hasRole) {
        return router.parseUrl('/noaccess');
      }

      return true;
    })
  );
}