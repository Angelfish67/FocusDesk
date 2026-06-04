import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc';
import { expect } from 'vitest';
import { authConfig } from '../../../app/app.config';
import { provideTranslateService } from '@ngx-translate/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OAuthModule.forRoot({ resourceServer: { sendAccessToken: true } }),
        DashboardComponent,
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
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
