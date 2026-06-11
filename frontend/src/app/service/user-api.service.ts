import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface UserResponse {
  id: number;
  username?: string;
  email?: string;
  keycloakId?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: UserResponse;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private http = inject(HttpClient);

  private apiUrl = environment.backendBaseUrl;

  createUser(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.apiUrl}/users/create`,
      request
    );
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/users/login`,
      request
    );
  }

  syncCurrentUser(): Observable<CurrentUserResponse> {
      return this.http.post<CurrentUserResponse>(
        `${this.apiUrl}/users/me/sync`,
        {}
      );
    }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.apiUrl}/users/me`
    );
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.apiUrl}/users/${id}`
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/users/delete/${id}`
    );
  }

  changePassword(request: PasswordChangeRequest): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/users/change_password`,
      request
    );
  }
}