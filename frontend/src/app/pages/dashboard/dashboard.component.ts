import { Component, OnInit, inject } from '@angular/core';
import {AppAuthService} from '../../service/app.auth.service';
import {HeaderService} from '../../service/header.service';

import { AppLoginComponent } from '../../components/app-login/app-login.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [AppLoginComponent, TranslateModule]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AppAuthService);
  private headerService = inject(HeaderService);

  useralias = '';
  username = '';

  constructor() {
    this.headerService.setPage('nav.dashboard');
  }

  ngOnInit(): void {
    this.authService.usernameObservable.subscribe(name => {
      this.username = name;
    });
    this.authService.useraliasObservable.subscribe(alias => {
      this.useralias = alias;
    });
  }

}
