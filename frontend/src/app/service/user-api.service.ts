import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface CurrentUserResponse {
  id: number;
  username?: string;
  email?: string;
  keycloakId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private http = inject(HttpClient);

  private apiUrl = environment.backendBaseUrl;

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.apiUrl}/users/me`);
  }

  syncCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.post<CurrentUserResponse>(
      `${this.apiUrl}/users/me/sync`,
      {}
    );
  }
}