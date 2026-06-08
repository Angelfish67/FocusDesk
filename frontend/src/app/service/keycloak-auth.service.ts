import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
};

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokenUrl = 'http://localhost:8080/realms/kitcord/protocol/openid-connect/token';
  private clientId = 'kitcord';

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', this.clientId);
    body.set('username', username);
    body.set('password', password);

    return this.http.post<TokenResponse>(this.tokenUrl, body.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    }).pipe(
      tap(response => {
        sessionStorage.setItem('access_token', response.access_token);
        sessionStorage.setItem('refresh_token', response.refresh_token);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}