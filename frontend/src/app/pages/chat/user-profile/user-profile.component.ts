import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  private oauthService = inject(OAuthService);

  username = 'Benutzer';
  status = 'Online';
  initials = '?';

  constructor() {
    this.loadUserFromKeycloak();

    this.oauthService.events.subscribe(() => {
      this.loadUserFromKeycloak();
    });
  }

  logout(): void {
    this.oauthService.logOut();
  }

  private loadUserFromKeycloak(): void {
    const claims: any = this.oauthService.getIdentityClaims();

    if (!claims) {
      return;
    }

    const displayName =
      claims['preferred_username'] ||
      claims['name'] ||
      claims['given_name'] ||
      claims['email'] ||
      'Benutzer';

    this.username = displayName;
    this.initials = this.createInitials(displayName);
  }

  private createInitials(value: string): string {
    const parts = value
      .trim()
      .split(' ')
      .filter(part => part.length > 0);

    if (parts.length === 0) {
      return '?';
    }

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
}