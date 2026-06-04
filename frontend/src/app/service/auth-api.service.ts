import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type RegisterRequest = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  tokenType?: string;
  token_type?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:9090';

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/users/create`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, request).pipe(
      tap(response => {
        const accessToken = response.accessToken ?? response.access_token;
        const refreshToken = response.refreshToken ?? response.refresh_token;

        if (accessToken) {
          localStorage.setItem('access_token', accessToken);
        }

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}