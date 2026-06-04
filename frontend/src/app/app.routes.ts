import { Routes } from '@angular/router';

import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/account/login/login.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { NoAccessComponent } from './pages/no-access/no-access.component';
import { ChatComponent } from './pages/chat/chat.component';

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
    component: ChatComponent
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