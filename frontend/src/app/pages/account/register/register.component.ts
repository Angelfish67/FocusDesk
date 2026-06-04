import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

    if (!this.username || !this.email || !this.firstName || !this.lastName || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Bitte alle Felder ausfüllen.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    this.loading = true;

    this.authApiService.register({
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Konto wurde erstellt. Du kannst dich jetzt einloggen.';
        this.router.navigate(['/login']);
      },
      error: error => {
        this.loading = false;
        this.errorMessage = typeof error.error === 'string'
          ? error.error
          : 'Registrierung fehlgeschlagen.';
      }
    });
  }
}