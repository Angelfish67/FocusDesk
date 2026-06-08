import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HasRoleDirective } from '../../../dir/has-role.diretive';

import { UserProfileComponent } from '../user-profile/user-profile.component';
import { ChatApiService, ChatResponse, ChatType } from '../../../service/chat-api.service';

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
        this.chats = chats;
        this.loading = false;

        if (chats.length > 0) {
          this.selectChat(chats[0]);
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
        this.chats = [createdChat, ...this.chats];
        this.chatName = '';
        this.userIdsInput = '';
        this.chatType = 'GROUP';
        this.showCreateChat = false;
        this.loading = false;
        this.selectChat(createdChat);
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
}