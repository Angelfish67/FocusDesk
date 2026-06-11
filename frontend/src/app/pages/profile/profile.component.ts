import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  PasswordChangeRequest,
  UserApiService,
  UserResponse
} from '../../service/user-api.service';
import { AppAuthService } from '../../service/app.auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private userApiService = inject(UserApiService);
  private appAuthService = inject(AppAuthService);
  private router = inject(Router);

  currentUser: UserResponse | null = null;

  loading = false;
  savingPassword = false;
  syncing = false;
  deleting = false;

  errorMessage = '';
  successMessage = '';

  oldPassword = '';
  newPassword = '';
  repeatNewPassword = '';

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userApiService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Profil konnte nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  syncCurrentUser(): void {
    this.syncing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userApiService.syncCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.successMessage = 'Benutzer wurde erfolgreich synchronisiert.';
        this.syncing = false;
      },
      error: () => {
        this.errorMessage = 'Benutzer konnte nicht synchronisiert werden.';
        this.syncing = false;
      }
    });
  }

  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const validationError = this.validatePasswordForm();

    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    const request: PasswordChangeRequest = {
      oldPassword: this.oldPassword.trim(),
      newPassword: this.newPassword.trim()
    };

    this.savingPassword = true;

    this.userApiService.changePassword(request).subscribe({
      next: () => {
        this.successMessage = 'Passwort wurde erfolgreich geändert.';
        this.oldPassword = '';
        this.newPassword = '';
        this.repeatNewPassword = '';
        this.savingPassword = false;
      },
      error: (error) => {
        this.errorMessage = this.extractErrorMessage(
          error,
          'Passwort konnte nicht geändert werden.'
        );
        this.savingPassword = false;
      }
    });
  }

  deleteOwnUser(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.currentUser?.id) {
      this.errorMessage = 'Benutzer-ID wurde nicht gefunden.';
      return;
    }

    const confirmed = confirm(
      'Willst du dein Profil wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
    );

    if (!confirmed) {
      return;
    }

    this.deleting = true;

    this.userApiService.deleteUser(this.currentUser.id).subscribe({
      next: () => {
        this.deleting = false;
        this.appAuthService.logout();
      },
      error: (error) => {
        this.errorMessage = this.extractErrorMessage(
          error,
          'Benutzer konnte nicht gelöscht werden.'
        );
        this.deleting = false;
      }
    });
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }

  private validatePasswordForm(): string {
    const oldPassword = this.oldPassword.trim();
    const newPassword = this.newPassword.trim();
    const repeatNewPassword = this.repeatNewPassword.trim();

    if (!oldPassword) {
      return 'Bitte gib dein aktuelles Passwort ein.';
    }

    if (!newPassword) {
      return 'Bitte gib ein neues Passwort ein.';
    }

    if (newPassword.length < 8) {
      return 'Das neue Passwort muss mindestens 8 Zeichen lang sein.';
    }

    if (newPassword === oldPassword) {
      return 'Das neue Passwort darf nicht gleich wie das alte Passwort sein.';
    }

    if (newPassword !== repeatNewPassword) {
      return 'Die neuen Passwörter stimmen nicht überein.';
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