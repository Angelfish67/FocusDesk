import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AppAuthService } from '../service/app.auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AppAuthService);

  const publicUrls = [
    '/users/create',
    '/users/login',
    '/assets/',
    '/realms/',
    '/protocol/openid-connect/token'
  ];

  const isPublicUrl = publicUrls.some(url => request.url.includes(url));

  if (isPublicUrl) {
    return next(request);
  }

  const token = authService.getAccessToken();

  if (!token || token === 'null' || token === 'undefined') {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authenticatedRequest);
};