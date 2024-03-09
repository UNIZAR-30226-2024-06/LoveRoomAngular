import { Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { MisSalasComponent } from './mis-salas/mis-salas.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', title: 'LoveRoom', component: PaginaPrincipalComponent },
    { path: 'mis-salas', title: 'Mis salas', component: MisSalasComponent},
    { path: 'login', title: 'Login', component: LoginComponent},
    { path: '**', redirectTo: '', pathMatch: 'full' }
];