import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import {
  provideHttpClient,
  withInterceptors,
  withXsrfConfiguration
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
import { httpCsrfInterceptor } from './interceptor/http.csrf.interceptor';
import { AppAuthService } from './service/app.auth.service';
import { MatPaginatorI18nService } from './service/mat.intl.service';

if (environment.production) {
  enableProdMode();
}

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/kitcord',
  requireHttps: false,
  redirectUri: environment.frontendBaseUrl,
  postLogoutRedirectUri: environment.frontendBaseUrl,
  clientId: 'kitcord',
  scope: 'openid profile roles offline_access',
  responseType: 'code',
  showDebugInformation: true,
  requestAccessToken: true,
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
  silentRefreshTimeout: 500,
  clearHashAfterLogin: true,
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
      provide: MatPaginatorIntl,
      useClass: MatPaginatorI18nService
    },
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
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      }),
      withInterceptors([
        httpCsrfInterceptor,
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
      inject(AppAuthService).initAuth().finally();
    })
  ]
};