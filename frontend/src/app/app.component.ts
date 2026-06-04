import { Component, inject, OnInit, signal } from '@angular/core';
import {AppAuthService} from './service/app.auth.service';
import {OAuthService} from 'angular-oauth2-oidc';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DateAdapter, MatOption } from '@angular/material/core';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { MatDrawerContainer, MatDrawer } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';

import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [MatIconButton, MatIcon, AppHeaderComponent, MatDrawerContainer, MatDrawer, MatButton, RouterLink, MatFormField, MatLabel, MatSelect, MatOption, RouterOutlet, TranslateModule]
})
export class AppComponent implements OnInit {
  private authService = inject(AppAuthService);
  private dateAdapter = inject<DateAdapter<any>>(DateAdapter);
  oauthService = inject(OAuthService);
  translate = inject(TranslateService);
  useralias = signal('');

  public constructor() {
    this.translate.addLangs(['en', 'de_CH']);
    this.dateAdapter.setLocale('en');

    const savedLang = localStorage.getItem('demoapp.lang');
    if (savedLang) {
      this.setLanguage(savedLang);
      this.translate.use(savedLang);
    } else {
      this.translate.use('en');
    }
  }
  ngOnInit(): void {
    this.authService.useraliasObservable.subscribe(alias => {
      this.useralias.set(alias);
    });
  }

  logout() {
    this.authService.logout();
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.dateAdapter.setLocale(lang);
    localStorage.setItem('demoapp.lang', lang);
  }
}
