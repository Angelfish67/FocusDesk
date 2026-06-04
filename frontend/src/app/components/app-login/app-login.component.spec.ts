import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppLoginComponent } from './app-login.component';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { provideTranslateService } from '@ngx-translate/core';
import { authConfig } from '../../../app/app.config';
import { expect } from 'vitest';

describe('AppLoginComponent', () => {
  let component: AppLoginComponent;
  let fixture: ComponentFixture<AppLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OAuthModule.forRoot({ resourceServer: { sendAccessToken: true } }),
        AppLoginComponent,
      ],
      providers: [
        { provide: AuthConfig, useValue: authConfig },
        provideTranslateService({
          fallbackLang: 'en',
          lang: 'en'
        }),
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
