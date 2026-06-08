import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  username = 'Benutzer';
  status = 'Online';
  initials = '?';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserFromToken();
  }

  logout(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  private loadUserFromToken(): void {
    const token = sessionStorage.getItem('access_token');

    if (!token) {
      return;
    }

    const payload = this.decodeJwtPayload(token);

    const displayName =
      payload?.preferred_username ||
      payload?.name ||
      payload?.given_name ||
      payload?.email ||
      'Benutzer';

    this.username = displayName;
    this.initials = this.createInitials(displayName);
  }

  private decodeJwtPayload(token: string): any {
    try {
      const payload = token.split('.')[1];
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = decodeURIComponent(
        atob(normalizedPayload)
          .split('')
          .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Token konnte nicht gelesen werden:', error);
      return null;
    }
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