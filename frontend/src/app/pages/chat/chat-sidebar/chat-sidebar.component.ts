import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { HasRoleDirective } from '../../../dir/has-role.diretive';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { AppAuthService } from '../../../service/app.auth.service';
import {
  ChatApiService,
  ChatResponse,
  ChatType,
  UserResponse
} from '../../../service/chat-api.service';

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
export class ChatSidebarComponent implements OnInit, OnDestroy {
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

  canCreateChat = false;

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.appAuthService.hasAnyRole(['update', 'admin']).subscribe(hasRole => {
        this.canCreateChat = hasRole;
      })
    );

    this.loadChats();

    this.subscriptions.add(
      this.chatApiService.selectedChat$.subscribe(chat => {
        this.selectedChat = chat;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadChats(): void {
    this.loading = true;
    this.errorMessage = '';

    this.chatApiService.getChats().subscribe({
      next: chats => {
        const currentUserValues = this.getCurrentUserValues();

        this.chats = (chats ?? []).filter(chat =>
          this.isCurrentUserInChat(chat, currentUserValues)
        );

        this.loading = false;

        if (this.chats.length > 0) {
          this.selectChat(this.chats[0]);
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
    if (!this.canCreateChat) {
      this.errorMessage = 'Du hast keine Berechtigung, Chats zu erstellen.';
      return;
    }

    this.showCreateChat = !this.showCreateChat;
    this.errorMessage = '';
  }

  createChat(): void {
    if (!this.canCreateChat) {
      this.errorMessage = 'Du hast keine Berechtigung, Chats zu erstellen.';
      return;
    }

    this.errorMessage = '';

    if (!this.chatName.trim()) {
      this.errorMessage = 'Bitte gib einen Chatnamen ein.';
      return;
    }

    const userIds = this.parseUserIds(this.userIdsInput);

    if (userIds.length === 0) {
      this.errorMessage = 'Bitte gib mindestens eine User-ID ein.';
      return;
    }

    if (this.chatType === 'GROUP' && userIds.length < 2) {
      this.errorMessage = 'Ein Gruppenchat braucht mindestens 2 User-IDs.';
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
        const currentUserValues = this.getCurrentUserValues();

        if (this.isCurrentUserInChat(createdChat, currentUserValues)) {
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
        this.errorMessage = typeof error?.error === 'string'
          ? error.error
          : 'Chat konnte nicht erstellt werden.';
        this.loading = false;
      }
    });
  }

  private parseUserIds(value: string): number[] {
    return Array.from(
      new Set(
        value
          .split(',')
          .map(id => Number(id.trim()))
          .filter(id => Number.isInteger(id) && id > 0)
      )
    );
  }

  private isCurrentUserInChat(
    chat: ChatResponse,
    currentUserValues: string[]
  ): boolean {
    if (!chat.users?.length || currentUserValues.length === 0) {
      return false;
    }

    return chat.users.some(user =>
      this.userMatchesCurrentUser(user, currentUserValues)
    );
  }

  private getCurrentUserValues(): string[] {
    const token = this.appAuthService.decodedAccessToken ?? {};
    const claims = this.appAuthService.getIdentityClaims?.() ?? {};

    return [
      token?.preferred_username,
      token?.name,
      token?.email,
      claims['preferred_username'],
      claims['name'],
      claims['email']
    ]
      .filter((value): value is string =>
        typeof value === 'string' && value.trim().length > 0
      )
      .map(value => value.trim().toLowerCase());
  }

  private userMatchesCurrentUser(
    user: UserResponse,
    currentUserValues: string[]
  ): boolean {
    const userValues = [
      user.username,
      user.email,
      user.keycloakId
    ]
      .filter((value): value is string =>
        typeof value === 'string' && value.trim().length > 0
      )
      .map(value => value.trim().toLowerCase());

    return userValues.some(userValue =>
      currentUserValues.includes(userValue)
    );
  }
}