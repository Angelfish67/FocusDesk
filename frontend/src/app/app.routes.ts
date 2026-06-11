import { Routes } from '@angular/router';

import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/account/login/login.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { NoAccessComponent } from './pages/no-access/no-access.component';
import { ChatLayoutComponent } from './pages/chat/chat-layout/chat-layout.component';
import { AdminConsoleComponent } from './pages/admin/admin-console.component';
import { AppAuthGuard } from './guard/app.auth.guard';
import { CallbackComponent } from './pages/callback/callback.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'auth/callback',
    component: CallbackComponent  
  },

  {
    path: 'chat',
    component: ChatLayoutComponent,
    canActivate: [AppAuthGuard],
    data: { roles: ['read', 'update', 'admin'] }
  },

  {
    path: 'admin',
    component: AdminConsoleComponent,
    canActivate: [AppAuthGuard],
    data: { roles: ['admin'] }
  },

  { path: 'noaccess', component: NoAccessComponent },
  { path: '**', redirectTo: '' }
];