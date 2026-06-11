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
  ChatResponse
} from '../../../service/chat-api.service';
import {
  MessageApiService,
  MessageResponse
} from '../../../service/message-api.service';

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
  private messageApiService = inject(MessageApiService);
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
      this.appAuthService
        .hasAnyRole(['ROLE_UPDATE', 'ROLE_ADMIN', 'update', 'admin'])
        .subscribe(hasRole => {
          this.canSendMessage = hasRole;
        })
    );

    this.subscriptions.add(
      this.appAuthService
        .hasAnyRole(['ROLE_ADMIN', 'admin'])
        .subscribe(hasRole => {
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

    this.messageApiService.getMessagesByChatId(chatId).subscribe({
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

    this.sendingMessage = true;
    this.errorMessage = '';

    this.messageApiService.sendMessage({
      chatId: this.selectedChat.id,
      content
    }).subscribe({
      next: message => {
        this.messages = [...this.messages, message];
        this.messageText = '';
        this.sendingMessage = false;
      },
      error: error => {
        console.error('Nachricht konnte nicht gesendet werden:', error);
        this.errorMessage = this.extractErrorMessage(
          error,
          'Nachricht konnte nicht gesendet werden.'
        );
        this.sendingMessage = false;
      }
    });
  }

  updateMessage(messageId: number, content: string): void {
    const trimmedContent = content.trim();
    const validationError = this.validateMessage(trimmedContent);

    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.messageApiService.updateMessage(messageId, {
      content: trimmedContent
    }).subscribe({
      next: updatedMessage => {
        this.messages = this.messages.map(message =>
          message.id === messageId ? updatedMessage : message
        );
      },
      error: error => {
        console.error('Nachricht konnte nicht aktualisiert werden:', error);
        this.errorMessage = this.extractErrorMessage(
          error,
          'Nachricht konnte nicht aktualisiert werden.'
        );
      }
    });
  }

  deleteMessage(messageId: number): void {
    if (!this.canOpenAdmin) {
      this.errorMessage = 'Du hast keine Berechtigung, Nachrichten zu löschen.';
      return;
    }

    this.messageApiService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter(message => message.id !== messageId);
      },
      error: error => {
        console.error('Nachricht konnte nicht gelöscht werden:', error);
        this.errorMessage = this.extractErrorMessage(
          error,
          'Nachricht konnte nicht gelöscht werden.'
        );
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

  private extractErrorMessage(error: any, fallback: string): string {
    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    return fallback;
  }
}