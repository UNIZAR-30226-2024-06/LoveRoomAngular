import { Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { MisSalasComponent } from './mis-salas/mis-salas.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', component: PaginaPrincipalComponent },
    { path: 'mis-salas', component: MisSalasComponent },
    { path: 'login', component: LoginComponent},
    { path: '**', redirectTo: '', pathMatch: 'full' }
    

];
