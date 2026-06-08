import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HasRoleDirective } from '../../../dir/has-role.diretive';

import { UserProfileComponent } from '../user-profile/user-profile.component';
import { AppAuthService } from '../../../service/app.auth.service';
import { ChatApiService, ChatResponse, ChatType, UserResponse } from '../../../service/chat-api.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    UserProfileComponent,
    HasRoleDirective
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent implements OnInit {
  private chatApiService = inject(ChatApiService);
  private appAuthService = inject(AppAuthService);

  chats: ChatResponse[] = [];
  selectedChat: ChatResponse | null = null;

  showCreateChat = false;
  loading = false;
  errorMessage = '';

  chatName = '';
  chatType: ChatType = 'GROUP';
  userIdsInput = '';

  ngOnInit(): void {
    this.loadChats();

    this.chatApiService.selectedChat$.subscribe(chat => {
      this.selectedChat = chat;
    });
  }

  loadChats(): void {
    this.loading = true;
    this.errorMessage = '';

    this.chatApiService.getChats().subscribe({
      next: chats => {
        const ownChats = (chats ?? []).filter(chat => this.isCurrentUserInChat(chat));

        this.chats = ownChats;
        this.loading = false;

        if (ownChats.length > 0) {
          this.selectChat(ownChats[0]);
        } else {
          this.chatApiService.selectChat(null);
        }
      },
      error: error => {
        console.error('Chats konnten nicht geladen werden:', error);
        this.errorMessage = 'Chats konnten nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  selectChat(chat: ChatResponse): void {
    this.chatApiService.selectChat(chat);
  }

  toggleCreateChat(): void {
    this.showCreateChat = !this.showCreateChat;
    this.errorMessage = '';
  }

  createChat(): void {
    this.errorMessage = '';

    const userIds = this.parseUserIds(this.userIdsInput);

    if (!this.chatName.trim()) {
      this.errorMessage = 'Bitte gib einen Chatnamen ein.';
      return;
    }

    if (userIds.length === 0) {
      this.errorMessage = 'Bitte gib mindestens eine User-ID ein.';
      return;
    }

    if (this.chatType === 'DIRECT' && userIds.length !== 2) {
      this.errorMessage = 'Ein Direktchat braucht genau 2 User-IDs.';
      return;
    }

    this.loading = true;

    this.chatApiService.createChat({
      name: this.chatName.trim(),
      chatType: this.chatType,
      userIds
    }).subscribe({
      next: createdChat => {
        if (this.isCurrentUserInChat(createdChat)) {
          this.chats = [createdChat, ...this.chats];
          this.selectChat(createdChat);
        }

        this.chatName = '';
        this.userIdsInput = '';
        this.chatType = 'GROUP';
        this.showCreateChat = false;
        this.loading = false;
      },
      error: error => {
        console.error('Chat konnte nicht erstellt werden:', error);
        this.errorMessage = typeof error.error === 'string'
          ? error.error
          : 'Chat konnte nicht erstellt werden.';
        this.loading = false;
      }
    });
  }

  private parseUserIds(value: string): number[] {
    return value
      .split(',')
      .map(id => Number(id.trim()))
      .filter(id => !Number.isNaN(id) && id > 0);
  }

  private isCurrentUserInChat(chat: ChatResponse): boolean {
    const currentUserValues = this.getCurrentUserValues();

    if (currentUserValues.length === 0) {
      return false;
    }

    return chat.users?.some(user => this.userMatchesCurrentUser(user, currentUserValues)) ?? false;
  }

  private getCurrentUserValues(): string[] {
    const token = this.appAuthService.decodedAccessToken ?? {};
    const claims = this.appAuthService.getIdentityClaims?.() ?? {};

    return [
      token?.sub,
      token?.preferred_username,
      token?.name,
      token?.email,
      claims['sub'],
      claims['preferred_username'],
      claims['name'],
      claims['email']
    ]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(value => value.trim().toLowerCase());
  }

  private userMatchesCurrentUser(user: UserResponse, currentUserValues: string[]): boolean {
    const userValues = [
      user.keycloakId,
      user.username,
      user.email,
      user.firstName,
      user.lastName,
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    ]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(value => value.trim().toLowerCase());

    return userValues.some(userValue => currentUserValues.includes(userValue));
  }
}