import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  AdminApiService,
  AdminCreateUserRequest,
  AdminUpdateUserRequest
} from '../../service/admin-api.service';
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
    FormsModule,
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

  editingUserId: number | null = null;

  userForm: AdminCreateUserRequest = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    keycloakId: ''
  };

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

  saveUser(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const username = this.userForm.username.trim();

    if (username.length < 2) {
      this.errorMessage = 'Der Benutzername muss mindestens 2 Zeichen lang sein.';
      return;
    }

    const request: AdminCreateUserRequest | AdminUpdateUserRequest = {
      username,
      email: this.cleanOptionalValue(this.userForm.email),
      firstName: this.cleanOptionalValue(this.userForm.firstName),
      lastName: this.cleanOptionalValue(this.userForm.lastName),
      keycloakId: this.cleanOptionalValue(this.userForm.keycloakId)
    };

    this.loading = true;

    if (this.editingUserId !== null) {
      this.adminApiService.updateUser(this.editingUserId, request).subscribe({
        next: updatedUser => {
          this.users = this.users.map(user =>
            user.id === updatedUser.id ? updatedUser : user
          );

          this.successMessage = 'Benutzer wurde aktualisiert.';
          this.resetUserForm();
          this.loading = false;
          this.loadChats();
          this.loadMessages();
        },
        error: error => {
          console.error(error);
          this.errorMessage = 'Benutzer konnte nicht aktualisiert werden.';
          this.loading = false;
        }
      });

      return;
    }

    this.adminApiService.createUser(request).subscribe({
      next: createdUser => {
        this.users = [...this.users, createdUser];
        this.successMessage = 'Benutzer wurde erstellt.';
        this.resetUserForm();
        this.loading = false;
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Benutzer konnte nicht erstellt werden.';
        this.loading = false;
      }
    });
  }

  startEditUser(user: UserResponse): void {
    if (!user.id) {
      return;
    }

    this.editingUserId = user.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.userForm = {
      username: user.username ?? '',
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      keycloakId: user.keycloakId ?? ''
    };
  }

  cancelEdit(): void {
    this.resetUserForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetUserForm(): void {
    this.editingUserId = null;

    this.userForm = {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      keycloakId: ''
    };
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

        if (this.editingUserId === user.id) {
          this.resetUserForm();
        }

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

  private cleanOptionalValue(value: string | undefined): string | undefined {
    const cleanedValue = value?.trim();

    if (!cleanedValue) {
      return undefined;
    }

    return cleanedValue;
  }
}