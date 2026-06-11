import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AppAuthService } from '../../service/app.auth.service';

@Component({
  selector: 'app-no-access',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './no-access.component.html',
  styleUrls: ['./no-access.component.scss']
})
export class NoAccessComponent {
  protected oauthService = inject(AppAuthService);

  login(): void {
    this.oauthService.login();
  }
}