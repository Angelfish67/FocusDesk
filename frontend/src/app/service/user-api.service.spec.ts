import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import {
  UserApiService,
  CreateUserRequest,
  LoginRequest,
  PasswordChangeRequest
} from './user-api.service';

import { environment } from '../../environments/environment';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.backendBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create user', () => {
    const request: CreateUserRequest = {
      username: 'testuser',
      email: 'test@test.ch',
      password: 'password123'
    };

    const response = {
      id: 1,
      username: 'testuser',
      email: 'test@test.ch'
    };

    service.createUser(request).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/create`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(response);
  });

  it('should login user', () => {
    const request: LoginRequest = {
      email: 'test@test.ch',
      password: 'password123'
    };

    const response = {
      accessToken: 'jwt-token'
    };

    service.login(request).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/login`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(response);
  });

  it('should sync current user', () => {
    const response = {
      id: 1,
      username: 'testuser',
      email: 'test@test.ch'
    };

    service.syncCurrentUser().subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/me/sync`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});

    req.flush(response);
  });

  it('should get current user', () => {
    const response = {
      id: 1,
      username: 'testuser'
    };

    service.getCurrentUser().subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/me`);

    expect(req.request.method).toBe('GET');

    req.flush(response);
  });

  it('should get user by id', () => {
    const response = {
      id: 5,
      username: 'otheruser'
    };

    service.getUserById(5).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/5`);

    expect(req.request.method).toBe('GET');

    req.flush(response);
  });

  it('should delete user', () => {
    service.deleteUser(5).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/users/delete/5`);

    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  it('should change password', () => {
    const request: PasswordChangeRequest = {
      oldPassword: 'oldPassword',
      newPassword: 'newPassword'
    };

    service.changePassword(request).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(
      `${apiUrl}/users/change_password`
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);

    req.flush(null);
  });
});