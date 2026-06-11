import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { HasRoleDirective } from '../../../dir/has-role.diretive';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { AppAuthService } from '../../../service/app.auth.service';
import { UserApiService } from '../../../service/user-api.service';
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
  private userApiService = inject(UserApiService);

  chats: ChatResponse[] = [];
  selectedChat: ChatResponse | null = null;

  showCreateChat = false;
  showChatList = true;
  showManageChat = false;

  loading = false;
  errorMessage = '';

  chatName = '';
  chatType: ChatType = 'GROUP';
  userIdsInput = '';

  editChatName = '';
  editChatType: ChatType = 'GROUP';
  manageUserId: number | null = null;

  currentUserId: number | null = null;

  canCreateChat = false;
  canUpdateChat = false;
  canDeleteChat = false;

  readonly minChatNameLength = 3;
  readonly maxChatNameLength = 40;
  readonly maxUserIdsLength = 100;

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.appAuthService.hasAnyRole(['ROLE_UPDATE', 'ROLE_ADMIN', 'update', 'admin']).subscribe(hasRole => {
        this.canCreateChat = hasRole;
        this.canUpdateChat = hasRole;
      })
    );

    this.subscriptions.add(
      this.appAuthService.hasAnyRole(['ROLE_ADMIN', 'admin']).subscribe(hasRole => {
        this.canDeleteChat = hasRole;
      })
    );

    this.loadCurrentUser();
    this.loadChats();

    this.subscriptions.add(
      this.chatApiService.selectedChat$.subscribe(chat => {
        this.selectedChat = chat;

        if (chat) {
          this.editChatName = chat.name;
          this.editChatType = chat.chatType;
        } else {
          this.editChatName = '';
          this.editChatType = 'GROUP';
          this.manageUserId = null;
          this.showManageChat = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleChatList(): void {
    this.showChatList = !this.showChatList;
  }

  toggleManageChat(): void {
    this.showManageChat = !this.showManageChat;
  }

  private loadCurrentUser(): void {
    this.userApiService.getCurrentUser().subscribe({
      next: user => {
        this.currentUserId = user.id;
      },
      error: error => {
        console.error('Eigener User konnte nicht geladen werden:', error);
        this.errorMessage = 'Eigener User konnte nicht geladen werden.';
      }
    });
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
    this.errorMessage = '';

    this.chatApiService.getChatById(chat.id).subscribe({
      next: loadedChat => {
        this.chatApiService.selectChat(loadedChat);
      },
      error: error => {
        console.error('Chat konnte nicht geladen werden:', error);
        this.errorMessage = 'Chat konnte nicht geladen werden.';
      }
    });
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

    if (!this.currentUserId) {
      this.errorMessage = 'Deine eigene User-ID konnte noch nicht geladen werden.';
      return;
    }

    this.errorMessage = '';

    const name = this.chatName.trim();
    const enteredUserIds = this.parseUserIds(this.userIdsInput);
    const userIds = this.addCurrentUserId(enteredUserIds);

    const validationError = this.validateChatInput(name, this.chatType, enteredUserIds);

    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.loading = true;

    this.chatApiService.createChat({
      name,
      chatType: this.chatType,
      userIds
    }).subscribe({
      next: createdChat => {
        this.chats = [createdChat, ...this.chats];
        this.selectChat(createdChat);

        this.chatName = '';
        this.userIdsInput = '';
        this.chatType = 'GROUP';
        this.showCreateChat = false;
        this.showChatList = true;
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

  updateSelectedChat(): void {
    if (!this.canUpdateChat) {
      this.errorMessage = 'Du hast keine Berechtigung, Chats zu bearbeiten.';
      return;
    }

    if (!this.selectedChat) {
      this.errorMessage = 'Bitte wähle zuerst einen Chat aus.';
      return;
    }

    const name = this.editChatName.trim();
    const validationError = this.validateUpdateChatInput(name, this.editChatType);

    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.chatApiService.updateChat(this.selectedChat.id, {
      name,
      chatType: this.editChatType
    }).subscribe({
      next: updatedChat => {
        this.chats = this.chats.map(chat =>
          chat.id === updatedChat.id ? updatedChat : chat
        );

        this.chatApiService.selectChat(updatedChat);
        this.loading = false;
      },
      error: error => {
        console.error('Chat konnte nicht aktualisiert werden:', error);
        this.errorMessage = typeof error?.error === 'string'
          ? error.error
          : 'Chat konnte nicht aktualisiert werden.';
        this.loading = false;
      }
    });
  }

  deleteSelectedChat(): void {
    if (!this.canDeleteChat) {
      this.errorMessage = 'Du hast keine Berechtigung, Chats zu löschen.';
      return;
    }

    if (!this.selectedChat) {
      this.errorMessage = 'Bitte wähle zuerst einen Chat aus.';
      return;
    }

    const chatId = this.selectedChat.id;

    this.loading = true;
    this.errorMessage = '';

    this.chatApiService.deleteChat(chatId).subscribe({
      next: () => {
        this.chats = this.chats.filter(chat => chat.id !== chatId);

        if (this.chats.length > 0) {
          this.selectChat(this.chats[0]);
        } else {
          this.chatApiService.selectChat(null);
        }

        this.showManageChat = false;
        this.loading = false;
      },
      error: error => {
        console.error('Chat konnte nicht gelöscht werden:', error);
        this.errorMessage = typeof error?.error === 'string'
          ? error.error
          : 'Chat konnte nicht gelöscht werden.';
        this.loading = false;
      }
    });
  }

deleteChat(chat: ChatResponse, event?: MouseEvent): void {
  event?.stopPropagation();

  if (!this.canDeleteChat) {
    this.errorMessage = 'Du hast keine Berechtigung, Chats zu löschen.';
    return;
  }

  const confirmed = window.confirm(`Möchtest du den Chat "${chat.name || 'Unbenannter Chat'}" wirklich löschen?`);

  if (!confirmed) {
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  this.chatApiService.deleteChat(chat.id).subscribe({
    next: () => {
      this.chats = this.chats.filter(existingChat => existingChat.id !== chat.id);

      if (this.selectedChat?.id === chat.id) {
        if (this.chats.length > 0) {
          this.selectChat(this.chats[0]);
        } else {
          this.chatApiService.selectChat(null);
        }
      }

      this.showManageChat = false;
      this.loading = false;
    },
    error: error => {
      console.error('Chat konnte nicht gelöscht werden:', error);
      this.errorMessage = typeof error?.error === 'string'
        ? error.error
        : 'Chat konnte nicht gelöscht werden.';
      this.loading = false;
    }
  });
}
  
  addUserToSelectedChat(): void {
    if (!this.canUpdateChat) {
      this.errorMessage = 'Du hast keine Berechtigung, User hinzuzufügen.';
      return;
    }

    if (!this.selectedChat) {
      this.errorMessage = 'Bitte wähle zuerst einen Chat aus.';
      return;
    }

    if (!this.manageUserId || this.manageUserId <= 0) {
      this.errorMessage = 'Bitte gib eine gültige User-ID ein.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.chatApiService.addUserToChat(this.selectedChat.id, this.manageUserId).subscribe({
      next: updatedChat => {
        this.chats = this.chats.map(chat =>
          chat.id === updatedChat.id ? updatedChat : chat
        );

        this.chatApiService.selectChat(updatedChat);
        this.manageUserId = null;
        this.loading = false;
      },
      error: error => {
        console.error('User konnte nicht hinzugefügt werden:', error);
        this.errorMessage = typeof error?.error === 'string'
          ? error.error
          : 'User konnte nicht hinzugefügt werden.';
        this.loading = false;
      }
    });
  }

  removeUserFromSelectedChat(): void {
    if (!this.canUpdateChat) {
      this.errorMessage = 'Du hast keine Berechtigung, User zu entfernen.';
      return;
    }

    if (!this.selectedChat) {
      this.errorMessage = 'Bitte wähle zuerst einen Chat aus.';
      return;
    }

    if (!this.manageUserId || this.manageUserId <= 0) {
      this.errorMessage = 'Bitte gib eine gültige User-ID ein.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.chatApiService.removeUserFromChat(this.selectedChat.id, this.manageUserId).subscribe({
      next: updatedChat => {
        this.chats = this.chats.map(chat =>
          chat.id === updatedChat.id ? updatedChat : chat
        );

        this.chatApiService.selectChat(updatedChat);
        this.manageUserId = null;
        this.loading = false;
      },
      error: error => {
        console.error('User konnte nicht entfernt werden:', error);
        this.errorMessage = typeof error?.error === 'string'
          ? error.error
          : 'User konnte nicht entfernt werden.';
        this.loading = false;
      }
    });
  }

  private addCurrentUserId(userIds: number[]): number[] {
    if (!this.currentUserId) {
      return userIds;
    }

    return Array.from(new Set([this.currentUserId, ...userIds]));
  }

  private validateUpdateChatInput(name: string, chatType: ChatType): string {
    if (!name) {
      return 'Bitte gib einen Chatnamen ein.';
    }

    if (name.length < this.minChatNameLength) {
      return `Der Chatname muss mindestens ${this.minChatNameLength} Zeichen lang sein.`;
    }

    if (name.length > this.maxChatNameLength) {
      return `Der Chatname darf maximal ${this.maxChatNameLength} Zeichen lang sein.`;
    }

    if (!/^[A-Za-zÄÖÜäöü0-9 _-]+$/.test(name)) {
      return 'Der Chatname darf nur Buchstaben, Zahlen, Leerzeichen, - und _ enthalten.';
    }

    if (chatType !== 'GROUP' && chatType !== 'DIRECT') {
      return 'Ungültiger Chattyp.';
    }

    return '';
  }

  private validateChatInput(name: string, chatType: ChatType, enteredUserIds: number[]): string {
    const updateValidationError = this.validateUpdateChatInput(name, chatType);

    if (updateValidationError) {
      return updateValidationError;
    }

    if (!this.userIdsInput.trim()) {
      return 'Bitte gib mindestens eine andere User-ID ein.';
    }

    if (this.userIdsInput.length > this.maxUserIdsLength) {
      return `Die User-ID Eingabe darf maximal ${this.maxUserIdsLength} Zeichen lang sein.`;
    }

    if (!/^[0-9,\s]+$/.test(this.userIdsInput)) {
      return 'User-IDs dürfen nur Zahlen und Kommas enthalten.';
    }

    if (enteredUserIds.length === 0) {
      return 'Bitte gib mindestens eine gültige andere User-ID ein.';
    }

    if (this.currentUserId && enteredUserIds.includes(this.currentUserId)) {
      return 'Bitte gib nur andere User-IDs ein. Deine eigene User-ID wird automatisch hinzugefügt.';
    }

    if (chatType === 'GROUP' && enteredUserIds.length < 1) {
      return 'Ein Gruppenchat braucht mindestens eine weitere User-ID.';
    }

    if (chatType === 'DIRECT' && enteredUserIds.length !== 1) {
      return 'Ein Direktchat braucht genau eine andere User-ID.';
    }

    return '';
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