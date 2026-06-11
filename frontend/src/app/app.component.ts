import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppAuthService } from './service/app.auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {
  private appAuthService = inject(AppAuthService);

  async ngOnInit(): Promise<void> {
    await this.appAuthService.initAuth();
  }
}