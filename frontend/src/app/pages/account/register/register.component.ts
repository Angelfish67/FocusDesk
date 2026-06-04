import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { AuthApiService } from '../../../service/auth-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private authApiService = inject(AuthApiService);
  private router = inject(Router);

  username = '';
  email = '';
  firstName = '';
  lastName = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.username.trim() ||
      !this.email.trim() ||
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Bitte alle Felder ausfüllen.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    this.loading = true;

    const email = this.email.trim();
    const password = this.password;

    this.authApiService.register({
      username: this.username.trim(),
      email,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      password
    }).pipe(
      switchMap(() => this.authApiService.login({
        email,
        password
      }))
    ).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Konto wurde erstellt.';
        this.router.navigateByUrl('/chat');
      },
      error: error => {
        this.loading = false;
        console.error('Registrierung/Login fehlgeschlagen:', error);

        this.errorMessage = typeof error.error === 'string'
          ? error.error
          : 'Registrierung fehlgeschlagen.';
      }
    });
  }
}