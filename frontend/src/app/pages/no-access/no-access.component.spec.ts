import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoAccessComponent } from './no-access.component';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { expect } from 'vitest';
import { authConfig } from '../../../app/app.config';
import { provideTranslateService } from '@ngx-translate/core';

describe('NoAccessComponent', () => {
  let component: NoAccessComponent;
  let fixture: ComponentFixture<NoAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OAuthModule.forRoot({ resourceServer: { sendAccessToken: true } }),
        NoAccessComponent,
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
    fixture = TestBed.createComponent(NoAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
