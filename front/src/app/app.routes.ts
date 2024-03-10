import { Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { MisSalasComponent } from './mis-salas/mis-salas.component';
import { LoginComponent } from './login/login.component';
import { RegistrarseComponent } from './registrarse/registrarse.component';

export const routes: Routes = [
    { path: '', title: 'LoveRoom', component: PaginaPrincipalComponent },
    { path: 'mis-salas', title: 'Mis salas', component: MisSalasComponent},
    { path: 'login', title: 'Iniciar sesión', component: LoginComponent},
    { path: 'registrarse', title: 'Registrarse', component: RegistrarseComponent},
    { path: '**', redirectTo: '', pathMatch: 'full' }
];