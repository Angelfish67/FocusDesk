import { HttpInterceptorFn, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';

export const httpCsrfInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenExtractor = inject(HttpXsrfTokenExtractor);

  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const shouldAddToken = unsafeMethods.includes(request.method.toUpperCase());

  if (!shouldAddToken) {
    return next(request);
  }

  const token = tokenExtractor.getToken();

  if (!token || request.headers.has('X-XSRF-TOKEN')) {
    return next(request);
  }

  const csrfRequest = request.clone({
    setHeaders: {
      'X-XSRF-TOKEN': token
    }
  });

  return next(csrfRequest);
};