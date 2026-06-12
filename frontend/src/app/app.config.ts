import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  ApplicationConfig,
  enableProdMode,
  importProvidersFrom,
  inject,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';
import {
  AuthConfig,
  OAuthStorage,
  provideOAuthClient
} from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authTokenInterceptor } from './interceptor/auth-token.interceptor';
import { AppAuthService } from './service/app.auth.service';


if (environment.production) {
  enableProdMode();
}

const frontendBaseUrl = 'http://localhost:4200';
const keycloakIssuer = 'http://localhost:8080/realms/kitcord';

export const authConfig: AuthConfig = {
  issuer: keycloakIssuer,
  requireHttps: false,

  redirectUri: `${frontendBaseUrl}/auth/callback`,
  postLogoutRedirectUri: frontendBaseUrl,

  clientId: 'kitcord',
  scope: 'openid profile email roles offline_access',
  responseType: 'code',

  showDebugInformation: true,
  requestAccessToken: true,
  clearHashAfterLogin: true,
  strictDiscoveryDocumentValidation: false,

  silentRefreshRedirectUri: `${frontendBaseUrl}/silent-refresh.html`,
  silentRefreshTimeout: 500,
  waitForTokenInMsec: 1000
};

export function storageFactory(): OAuthStorage {
  return sessionStorage;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),

    importProvidersFrom(
      BrowserModule,
      MatMomentDateModule
    ),

    provideRouter(routes),

    {
      provide: AuthConfig,
      useValue: authConfig
    },
    {
      provide: OAuthStorage,
      useFactory: storageFactory
    },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },

    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),

    provideHttpClient(
      withInterceptors([
        authTokenInterceptor
      ])
    ),

    provideOAuthClient({
      resourceServer: {
        sendAccessToken: false,
        allowedUrls: []
      }
    }),

    provideEnvironmentInitializer(() => {
      inject(AppAuthService).initAuth().catch(error => console.error(error));
    })
  ]
};