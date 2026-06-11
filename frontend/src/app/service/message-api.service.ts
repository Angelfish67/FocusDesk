import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface UserResponse {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  keycloakId?: string;
}

export interface MessageResponse {
  id: number;
  content?: string;
  message?: string;
  sentAt?: string;
  createdAt?: string;
  updatedAt?: string;
  editedAt?: string | null;
  chatId?: number;
  userId?: number;
  username?: string;
  sender?: UserResponse;
}

export interface CreateMessageRequest {
  chatId: number;
  content: string;
}

export interface UpdateMessageRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageApiService {
  private http = inject(HttpClient);

  private apiUrl = environment.backendBaseUrl;

  getMessages(): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(
      `${this.apiUrl}/messages`
    );
  }

  getMessagesByChatId(chatId: number): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(
      `${this.apiUrl}/messages/chat/${chatId}`
    );
  }

  getMessageById(id: number): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(
      `${this.apiUrl}/messages/${id}`
    );
  }

  sendMessage(request: CreateMessageRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/messages`,
      request
    );
  }

  updateMessage(id: number, request: UpdateMessageRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      `${this.apiUrl}/messages/${id}`,
      request
    );
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/messages/${id}`
    );
  }
}