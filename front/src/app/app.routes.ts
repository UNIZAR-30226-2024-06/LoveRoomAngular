import { Routes } from '@angular/router';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { MisSalasComponent } from './mis-salas/mis-salas.component';
import { LoginComponent } from './login/login.component';
import { RegistrarseComponent } from './registrarse/registrarse.component';
import { PerfilComponent } from './perfil/perfil.component';
import { EditPerfilComponent } from './edit-perfil/edit-perfil.component';
import { EditPasswordComponent } from './edit-password/edit-password.component';
import { SalaComponent } from './sala/sala.component';
import { UsuariosAdminComponent } from './usuarios-admin/usuarios-admin.component';
import { ConCuenta, SinCuenta, Admin } from './auth.guard';


export const routes: Routes = [
    { path: '', title: 'LoveRoom', component: PaginaPrincipalComponent },
    { path: 'mis-salas', title: 'Mis salas', component: MisSalasComponent},
    { path: 'login', title: 'Iniciar sesión', component: LoginComponent, canActivate: [SinCuenta]},
    { path: 'registrarse', title: 'Registrarse', component: RegistrarseComponent, canActivate: [SinCuenta]},
    { path: 'perfil', title: 'Perfil', component: PerfilComponent, canActivate: [ConCuenta]},
    { path: 'edit-perfil', title: 'Editar perfil', component: EditPerfilComponent, canActivate: [ConCuenta]},
    { path: 'edit-password', title: 'Cambiar contraseña', component: EditPasswordComponent, canActivate: [ConCuenta]},
    { path: 'sala/:videoId', title: 'Sala', component: SalaComponent, canActivate: [ConCuenta]},
    { path: 'usuarios-admin', title: 'Usuarios admin', component: UsuariosAdminComponent, canActivate: [Admin]},
    { path: '**', redirectTo: '', pathMatch: 'full' }
];