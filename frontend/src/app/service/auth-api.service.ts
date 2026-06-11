import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrentUserResponse {
  id: number;
  username: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.backendBaseUrl;

  syncCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.post<CurrentUserResponse>(
      `${this.apiUrl}/users/me/sync`,
      {}
    );
  }
}