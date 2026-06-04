import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DateAdapter, MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';

import { AppAuthService } from './service/app.auth.service';
import { AppHeaderComponent } from './components/app-header/app-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterLink,
    RouterOutlet,

    MatButton,
    MatIconButton,
    MatIcon,

    MatDrawerContainer,
    MatDrawer,

    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,

    TranslateModule,
    AppHeaderComponent
  ]
})
export class AppComponent implements OnInit {
  private authService = inject(AppAuthService);
  private dateAdapter = inject<DateAdapter<any>>(DateAdapter);

  oauthService = inject(OAuthService);
  translate = inject(TranslateService);
  useralias = signal('');

  public constructor() {
    this.translate.addLangs(['en', 'de_CH']);

    const savedLang = localStorage.getItem('demoapp.lang');

    if (savedLang) {
      this.setLanguage(savedLang);
    } else {
      this.setLanguage('en');
    }
  }

  ngOnInit(): void {
    this.authService.useraliasObservable.subscribe(alias => {
      this.useralias.set(alias);
    });
  }

  logout(): void {
    this.authService.logout();
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.dateAdapter.setLocale(lang);
    localStorage.setItem('demoapp.lang', lang);
  }
}