import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { map, take } from 'rxjs';

import { OAuthService } from 'angular-oauth2-oidc';
import { AppAuthService } from '../service/app.auth.service';

export const AppAuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AppAuthService);
  const oauthService = inject(OAuthService);
  const router = inject(Router);

  if (!oauthService.hasValidAccessToken()) {
    return router.parseUrl('/noaccess');
  }

  return authService.getRoles().pipe(
    take(1),
    map((userRoles: string[]) => {
      const hasRoles = checkRoles(route, userRoles);

      if (!hasRoles) {
        return router.parseUrl('/noaccess');
      }

      return true;
    })
  );
};

function checkRoles(route: ActivatedRouteSnapshot, userRoles: string[]): boolean {
  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  return requiredRoles.some(role => userRoles.includes(role));
}

export const AppAuthGuardChild: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => AppAuthGuard(route, state);