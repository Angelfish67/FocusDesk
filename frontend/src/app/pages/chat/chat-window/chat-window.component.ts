import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MessageListComponent } from '../message-list/message-list.component';
import { AppAuthService } from '../../../service/app.auth.service';
import { HasRoleDirective } from '../../../dir/has-role.diretive';
import {
  ChatApiService,
  ChatResponse,
  MessageResponse,
  UserResponse
} from '../../../service/chat-api.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MessageListComponent,
    HasRoleDirective
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  private chatApiService = inject(ChatApiService);
  private appAuthService = inject(AppAuthService);
  private router = inject(Router);

  selectedChat: ChatResponse | null = null;
  messages: MessageResponse[] = [];

  messageText = '';
  loadingMessages = false;
  sendingMessage = false;
  errorMessage = '';

  canSendMessage = false;
  canOpenAdmin = false;

  readonly minMessageLength = 1;
  readonly maxMessageLength = 500;

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.appAuthService.hasAnyRole(['ROLE_UPDATE', 'ROLE_ADMIN', 'update', 'admin']).subscribe(hasRole => {
        this.canSendMessage = hasRole;
      })
    );

    this.subscriptions.add(
      this.appAuthService.hasAnyRole(['ROLE_ADMIN', 'admin']).subscribe(hasRole => {
        this.canOpenAdmin = hasRole;
      })
    );

    this.subscriptions.add(
      this.chatApiService.selectedChat$.subscribe(chat => {
        this.selectedChat = chat;
        this.messages = [];
        this.messageText = '';
        this.errorMessage = '';

        if (chat) {
          this.loadMessages(chat.id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openAdmin(): void {
    if (!this.canOpenAdmin) {
      return;
    }

    this.router.navigate(['/admin']);
  }

  loadMessages(chatId: number): void {
    this.loadingMessages = true;
    this.errorMessage = '';

    this.chatApiService.getMessagesByChat(chatId).subscribe({
      next: messages => {
        this.messages = messages ?? [];
        this.loadingMessages = false;
      },
      error: error => {
        console.error('Nachrichten konnten nicht geladen werden:', error);
        this.errorMessage = 'Nachrichten konnten nicht geladen werden.';
        this.loadingMessages = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.canSendMessage) {
      this.errorMessage = 'Du hast keine Berechtigung, Nachrichten zu senden.';
      return;
    }

    if (!this.selectedChat) {
      this.errorMessage = 'Bitte wähle zuerst einen Chat aus.';
      return;
    }

    if (this.sendingMessage) {
      return;
    }

    const content = this.messageText.trim();
    const validationError = this.validateMessage(content);

    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    const sender = this.getCurrentUserFromSelectedChat();

    if (!sender) {
      this.errorMessage = 'In diesem Chat wurde kein Benutzer gefunden.';
      return;
    }

    this.sendingMessage = true;
    this.errorMessage = '';

    this.chatApiService.sendMessage({
      content,
      chatId: this.selectedChat.id,
      senderId: sender.id
    }).subscribe({
      next: message => {
        this.messages = [...this.messages, message];
        this.messageText = '';
        this.sendingMessage = false;
      },
      error: error => {
        console.error('Nachricht konnte nicht gesendet werden:', error);
        this.errorMessage = typeof error?.error === 'string'
          ? error.error
          : 'Nachricht konnte nicht gesendet werden.';
        this.sendingMessage = false;
      }
    });
  }

  private validateMessage(content: string): string {
    if (!content) {
      return 'Bitte gib eine Nachricht ein.';
    }

    if (content.length < this.minMessageLength) {
      return `Die Nachricht muss mindestens ${this.minMessageLength} Zeichen lang sein.`;
    }

    if (content.length > this.maxMessageLength) {
      return `Die Nachricht darf maximal ${this.maxMessageLength} Zeichen lang sein.`;
    }

    if (!/^[\p{L}\p{N}\p{P}\p{Zs}\n\r]+$/u.test(content)) {
      return 'Die Nachricht enthält ungültige Zeichen.';
    }

    return '';
  }

  private getCurrentUserFromSelectedChat(): UserResponse | null {
    if (!this.selectedChat?.users?.length) {
      return null;
    }

    const token = this.appAuthService.decodedAccessToken ?? {};
    const claims = this.appAuthService.getIdentityClaims?.() ?? {};

    const currentUserValues = [
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

    const matchedUser = this.selectedChat.users.find(user => {
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

      return userValues.some(userValue =>
        currentUserValues.some(currentUserValue =>
          userValue === currentUserValue ||
          userValue.includes(currentUserValue) ||
          currentUserValue.includes(userValue)
        )
      );
    });

    if (matchedUser) {
      return matchedUser;
    }

    return this.selectedChat.users[0] ?? null;
  }
}