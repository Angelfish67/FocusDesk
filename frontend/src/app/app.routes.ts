import { Routes } from '@angular/router';

import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/account/login/login.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { NoAccessComponent } from './pages/no-access/no-access.component';
import { ChatLayoutComponent } from './pages/chat/chat-layout/chat-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
  },
  {
    path: 'homepage',
    component: HomepageComponent
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
    path: 'chat',
    component: ChatLayoutComponent
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