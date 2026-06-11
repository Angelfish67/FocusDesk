import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AppAuthService } from '../../service/app.auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {
  private appAuthService = inject(AppAuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.appAuthService.initAuth();

    setTimeout(async () => {
      if (this.appAuthService.hasValidAccessToken()) {
        await this.router.navigate(['/chat'], { replaceUrl: true });
        return;
      }

      await this.router.navigate(['/login'], { replaceUrl: true });
    }, 300);
  }
}