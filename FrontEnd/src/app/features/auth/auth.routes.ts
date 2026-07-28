import { Routes } from '@angular/router';
import { BootComponent } from './boot/boot.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'boot' },
  { path: 'boot', component: BootComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];
