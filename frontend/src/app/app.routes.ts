import {Routes} from '@angular/router';

import {appCanActivate} from './guard/app.auth.guard';

import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {NoAccessComponent} from './pages/no-access/no-access.component';

import {AppRoles} from '../app.roles';


export const routes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'dashboard', component: DashboardComponent},
 
  {path: 'noaccess', component: NoAccessComponent},
];
