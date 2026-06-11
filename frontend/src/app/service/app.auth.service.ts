import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  AuthConfig,
  OAuthErrorEvent,
  OAuthEvent,
  OAuthService
} from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';

import { UserApiService } from './user-api.service';

@Injectable({
  providedIn: 'root'
})
export class AppAuthService {
  private oauthService = inject(OAuthService);
  private authConfig = inject(AuthConfig);
  private router = inject(Router);
  private userApiService = inject(UserApiService);

  private jwtHelper = new JwtHelperService();

  private usernameSubject = new BehaviorSubject<string>('');
  public readonly usernameObservable: Observable<string> = this.usernameSubject.asObservable();

  private useraliasSubject = new BehaviorSubject<string>('');
  public readonly useraliasObservable: Observable<string> = this.useraliasSubject.asObservable();

  private accessTokenSubject = new BehaviorSubject<string>('');
  public readonly accessTokenObservable: Observable<string> = this.accessTokenSubject.asObservable();

  private _decodedAccessToken: any = null;
  private _accessToken = '';

  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private userSynced = false;

  get decodedAccessToken(): any {
    return this._decodedAccessToken;
  }

  get accessToken(): string {
    return this.getAccessToken();
  }

  async initAuth(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitAuth();
    return this.initPromise;
  }

  private async doInitAuth(): Promise<void> {
    this.oauthService.configure(this.authConfig);

    this.oauthService.events.subscribe(event => {
      this.handleEvents(event);
    });

    await this.oauthService.loadDiscoveryDocumentAndTryLogin();

    if (this.hasValidAccessToken()) {
      this.oauthService.setupAutomaticSilentRefresh();
      await this.syncUserWithBackend();
    }

    this.initialized = true;
    this.handleEvents(null);
  }

  public getAccessToken(): string {
    return this.oauthService.getAccessToken() || '';
  }

  public hasValidAccessToken(): boolean {
    const token = this.getAccessToken();

    if (!token || token === 'null' || token === 'undefined') {
      return false;
    }

    return !this.jwtHelper.isTokenExpired(token);
  }

  public getRoles(): Observable<string[]> {
    const token = this.getAccessToken();

    if (!token || this.jwtHelper.isTokenExpired(token)) {
      return of([]);
    }

    const decodedToken = this.jwtHelper.decodeToken(token);

    const realmRoles: string[] = decodedToken?.realm_access?.roles ?? [];

    const resourceRoles: string[] = Object.values(decodedToken?.resource_access ?? {})
      .flatMap((client: any) => client?.roles ?? []);

    const roles = [...realmRoles, ...resourceRoles]
      .filter(role => typeof role === 'string')
      .map(role => this.normalizeRole(role));

    return of([...new Set(roles)]);
  }

  public hasAnyRole(requiredRoles: string[]): Observable<boolean> {
    const normalizedRequiredRoles = requiredRoles.map(role => this.normalizeRole(role));

    return new Observable<boolean>(subscriber => {
      this.getRoles().subscribe(userRoles => {
        const hasRole = normalizedRequiredRoles.some(requiredRole =>
          userRoles.includes(requiredRole)
        );

        subscriber.next(hasRole);
        subscriber.complete();
      });
    });
  }

  public getIdentityClaims(): Record<string, any> {
    return this.oauthService.getIdentityClaims() ?? {};
  }

  public async login(): Promise<void> {
    await this.initAuth();

    if (this.hasValidAccessToken()) {
      await this.syncUserWithBackend();
      await this.router.navigateByUrl('/chat');
      return;
    }

    this.oauthService.initCodeFlow();
  }

  public logout(): void {
    this.oauthService.stopAutomaticRefresh();
    this.clearLocalAuthState();

    this.oauthService.logOut({
      client_id: this.authConfig.clientId,
      post_logout_redirect_uri: this.authConfig.postLogoutRedirectUri
    });
  }

 private async syncUserWithBackend(): Promise<void> {
  if (!this.hasValidAccessToken()) {
    console.log('Kein gültiger Access Token, User-Sync übersprungen.');
    return;
  }

  try {
    console.log('Starte User-Sync mit Backend...');
    const user = await firstValueFrom(this.userApiService.syncCurrentUser());
    console.log('User wurde synchronisiert:', user);
  } catch (error) {
    console.error('User konnte nicht mit Backend synchronisiert werden:', error);
  }
}

  private clearLocalAuthState(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('nonce');
    sessionStorage.removeItem('PKCE_verifier');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('refreshToken');

    this.useraliasSubject.next('');
    this.usernameSubject.next('');
    this.accessTokenSubject.next('');

    this._accessToken = '';
    this._decodedAccessToken = null;
    this.initialized = false;
    this.initPromise = null;
    this.userSynced = false;
  }

  private handleEvents(event: OAuthEvent | null): void {
    if (event instanceof OAuthErrorEvent) {
      console.error(event);
      return;
    }

    this._accessToken = this.getAccessToken();
    this.accessTokenSubject.next(this._accessToken);

    if (!this._accessToken) {
      this._decodedAccessToken = null;
      this.usernameSubject.next('');
      this.useraliasSubject.next('');
      return;
    }

    this._decodedAccessToken = this.jwtHelper.decodeToken(this._accessToken);

    const claims = this.getIdentityClaims();

    const givenName = this._decodedAccessToken?.given_name ?? claims['given_name'] ?? '';
    const familyName = this._decodedAccessToken?.family_name ?? claims['family_name'] ?? '';
    const preferredUsername =
      this._decodedAccessToken?.preferred_username ?? claims['preferred_username'] ?? '';
    const email = this._decodedAccessToken?.email ?? claims['email'] ?? '';

    let displayName = '';

    if (givenName && familyName) {
      displayName = `${givenName} ${familyName}`;
    } else if (givenName) {
      displayName = givenName;
    } else if (preferredUsername) {
      displayName = preferredUsername;
    } else if (email) {
      displayName = email;
    }

    this.usernameSubject.next(displayName);
    this.useraliasSubject.next(preferredUsername);
  }

  private normalizeRole(role: string): string {
    return role
      .replace(/^ROLE_/i, '')
      .replace(/^role_/i, '')
      .toLowerCase();
  }
}