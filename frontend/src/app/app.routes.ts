import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/account/login/login.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { NoAccessComponent } from './pages/no-access/no-access.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'noaccess',
    component: NoAccessComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];