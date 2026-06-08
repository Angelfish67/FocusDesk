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
import { OAuthService } from 'angular-oauth2-oidc';
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
  const oauthService = inject(OAuthService);
  const router = inject(Router);

  const accessToken = oauthService.getAccessToken();

  if (!accessToken || !oauthService.hasValidAccessToken()) {
    return router.parseUrl('/noaccess');
  }

  return authService.getRoles().pipe(
    take(1),
    map((userRoles: string[]) => {
      const hasRoles = checkRoles(route, userRoles);

      console.log('Benutzerrollen normalisiert:', normalizeRoles(userRoles));
      console.log('Benötigte Rollen normalisiert:', normalizeRoles(route.data['roles'] ?? []));

      if (!hasRoles) {
        return router.parseUrl('/noaccess');
      }

      return true;
    })
  );
}

function checkRoles(route: ActivatedRouteSnapshot, userRoles: string[]): boolean {
  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedRequiredRoles = normalizeRoles(requiredRoles);

  return normalizedRequiredRoles.some(requiredRole =>
    normalizedUserRoles.includes(requiredRole)
  );
}

function normalizeRoles(roles: string[]): string[] {
  return roles
    .filter(role => typeof role === 'string')
    .map(role => role.replace(/^ROLE_/i, '').toLowerCase());
}