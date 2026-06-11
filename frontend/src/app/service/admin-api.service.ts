import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ChatResponse,
  MessageResponse,
  UserResponse
} from './chat-api.service';

export type AdminCreateUserRequest = {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  keycloakId?: string;
};

export type AdminUpdateUserRequest = {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  keycloakId?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.backendBaseUrl;

  health(): Observable<string> {
    return this.http.get(`${this.apiUrl}/admin/health`, {
      responseType: 'text'
    });
  }

  dashboard(): Observable<string> {
    return this.http.get(`${this.apiUrl}/admin/dashboard`, {
      responseType: 'text'
    });
  }

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/admin/users`);
  }

  createUser(
    request: AdminCreateUserRequest
  ): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.apiUrl}/admin/users`,
      request
    );
  }

  updateUser(
    id: number,
    request: AdminUpdateUserRequest
  ): Observable<UserResponse> {
    return this.http.put<UserResponse>(
      `${this.apiUrl}/admin/users/${id}`,
      request
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/admin/users/${id}`
    );
  }

  getChats(): Observable<ChatResponse[]> {
    return this.http.get<ChatResponse[]>(
      `${this.apiUrl}/admin/chats`
    );
  }

  getMessages(): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(
      `${this.apiUrl}/admin/messages`
    );
  }
}