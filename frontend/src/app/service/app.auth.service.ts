import { Injectable, inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthConfig, OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppAuthService {
  private oauthService = inject(OAuthService);
  private authConfig = inject(AuthConfig);

  private jwtHelper = new JwtHelperService();

  private usernameSubject = new BehaviorSubject<string>('');
  public readonly usernameObservable: Observable<string> = this.usernameSubject.asObservable();

  private useraliasSubject = new BehaviorSubject<string>('');
  public readonly useraliasObservable: Observable<string> = this.useraliasSubject.asObservable();

  private accessTokenSubject = new BehaviorSubject<string>('');
  public readonly accessTokenObservable: Observable<string> = this.accessTokenSubject.asObservable();

  private _decodedAccessToken: any = null;
  private _accessToken = '';

  constructor() {
    this.handleEvents(null);
  }

  get decodedAccessToken(): any {
    return this._decodedAccessToken;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  async initAuth(): Promise<void> {
    this.oauthService.configure(this.authConfig);

    this.oauthService.events.subscribe(event => {
      this.handleEvents(event);
    });

    await this.oauthService.loadDiscoveryDocumentAndTryLogin();

    this.oauthService.setupAutomaticSilentRefresh();
    this.handleEvents(null);
  }

  public getRoles(): Observable<string[]> {
    const token = this.oauthService.getAccessToken();

    if (!token) {
      return of([]);
    }

    const decoded = this.jwtHelper.decodeToken(token);

    const realmRoles: string[] = decoded?.realm_access?.roles ?? [];

    const resourceRoles: string[] = Object.values(decoded?.resource_access ?? {})
      .flatMap((client: any) => client?.roles ?? []);

    const roles = [...realmRoles, ...resourceRoles]
      .filter(role => typeof role === 'string')
      .map(role => role.replace(/^ROLE_/i, '').toLowerCase());

    return of([...new Set(roles)]);
  }

  public getIdentityClaims(): Record<string, any> {
    return this.oauthService.getIdentityClaims() ?? {};
  }

  public logout(): void {
    this.oauthService.logOut();
    this.useraliasSubject.next('');
    this.usernameSubject.next('');
    this.accessTokenSubject.next('');
    this._accessToken = '';
    this._decodedAccessToken = null;
  }

  public login(): void {
    this.oauthService.initLoginFlow();
  }

  private handleEvents(event: any): void {
    if (event instanceof OAuthErrorEvent) {
      console.error(event);
      return;
    }

    this._accessToken = this.oauthService.getAccessToken();
    this.accessTokenSubject.next(this._accessToken);

    if (!this._accessToken) {
      this._decodedAccessToken = null;
      return;
    }

    this._decodedAccessToken = this.jwtHelper.decodeToken(this._accessToken);

    const claims = this.getIdentityClaims();

    const givenName = this._decodedAccessToken?.given_name ?? claims['given_name'] ?? '';
    const familyName = this._decodedAccessToken?.family_name ?? claims['family_name'] ?? '';
    const preferredUsername = this._decodedAccessToken?.preferred_username ?? claims['preferred_username'] ?? '';
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

    if (displayName) {
      this.usernameSubject.next(displayName);
    }

    if (preferredUsername) {
      this.useraliasSubject.next(preferredUsername);
    }
  }
}