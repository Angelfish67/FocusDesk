import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AdminApiService } from '../../service/admin-api.service';
import {
  ChatResponse,
  MessageResponse,
  UserResponse
} from '../../service/chat-api.service';

type AdminTab = 'users' | 'chats' | 'messages';

@Component({
  selector: 'app-admin-console',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './admin-console.component.html',
  styleUrls: ['./admin-console.component.scss']
})
export class AdminConsoleComponent implements OnInit {
  private adminApiService = inject(AdminApiService);

  activeTab: AdminTab = 'users';

  dashboardMessage = '';
  healthMessage = '';

  users: UserResponse[] = [];
  chats: ChatResponse[] = [];
  messages: MessageResponse[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminApiService.health().subscribe({
      next: value => this.healthMessage = value,
      error: error => {
        console.error(error);
        this.errorMessage = 'Du hast keinen Zugriff auf die Admin-Konsole.';
        this.loading = false;
      }
    });

    this.adminApiService.dashboard().subscribe({
      next: value => this.dashboardMessage = value,
      error: error => console.error(error)
    });

    this.loadUsers();
    this.loadChats();
    this.loadMessages();
  }

  loadUsers(): void {
    this.adminApiService.getUsers().subscribe({
      next: users => {
        this.users = users ?? [];
        this.loading = false;
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Benutzer konnten nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  loadChats(): void {
    this.adminApiService.getChats().subscribe({
      next: chats => this.chats = chats ?? [],
      error: error => console.error(error)
    });
  }

  loadMessages(): void {
    this.adminApiService.getMessages().subscribe({
      next: messages => this.messages = messages ?? [],
      error: error => console.error(error)
    });
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteUser(user: UserResponse): void {
    if (!user.id) {
      return;
    }

    const confirmed = confirm(`Benutzer "${user.username}" wirklich löschen?`);

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminApiService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(existingUser => existingUser.id !== user.id);
        this.successMessage = 'Benutzer wurde gelöscht.';
        this.loading = false;
        this.loadChats();
        this.loadMessages();
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Benutzer konnte nicht gelöscht werden.';
        this.loading = false;
      }
    });
  }

  getChatUsers(chat: ChatResponse): string {
    if (!chat.users || chat.users.length === 0) {
      return '-';
    }

    return chat.users
      .map(user => user.username || user.email || `ID ${user.id}`)
      .join(', ');
  }

  getMessageSender(message: MessageResponse): string {
    return message.sender?.username || message.sender?.email || '-';
  }
}