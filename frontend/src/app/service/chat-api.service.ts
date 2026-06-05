import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export type ChatType = 'DIRECT' | 'GROUP';

export type UserResponse = {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  keycloakId?: string;
};

export type ChatResponse = {
  id: number;
  name: string;
  chatType: ChatType;
  createdAt: string;
  users: UserResponse[];
};

export type CreateChatRequest = {
  name: string;
  chatType: ChatType;
  userIds: number[];
};

export type MessageResponse = {
  id: number;
  content: string;
  sentAt: string;
  editedAt: string | null;
  chatId?: number;
  sender: UserResponse;
};

export type CreateMessageRequest = {
  content: string;
  chatId: number;
  senderId: number;
};

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:9090';

  private selectedChatSubject = new BehaviorSubject<ChatResponse | null>(null);
  selectedChat$ = this.selectedChatSubject.asObservable();

  selectChat(chat: ChatResponse): void {
    this.selectedChatSubject.next(chat);
  }

  getChats(): Observable<ChatResponse[]> {
    return this.http.get<ChatResponse[]>(`${this.apiUrl}/chats`);
  }

  createChat(request: CreateChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chats`, request);
  }

  getMessagesByChat(chatId: number): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(`${this.apiUrl}/messages/chat/${chatId}`);
  }

  sendMessage(request: CreateMessageRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/messages`, request);
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/me`);
  }
}