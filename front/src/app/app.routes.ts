import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MisSalasComponent } from './mis-salas/mis-salas.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', component: AppComponent },
    { path: 'mis-salas', component: MisSalasComponent },
    { path: 'login', component: LoginComponent},
    { path: '**', redirectTo: '', pathMatch: 'full' }

];
