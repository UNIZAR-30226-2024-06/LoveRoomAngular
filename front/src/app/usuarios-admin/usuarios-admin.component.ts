import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule, CabeceraYMenuComponent],
  templateUrl: './usuarios-admin.component.html',
  styleUrl: './usuarios-admin.component.css'
})
export class UsuariosAdminComponent {
  imagenPerfil = 'assets/Logo.png'; //Quiza aqui traer la de la BD
  usuarios: any[] = [];
  error: string='';
  filteredUsuarios: any[] = [];
  searchQuery: string = '';

  constructor(private http: HttpClient, private router: Router) {
    this.obtenerTodosLosUsuarios();
  }

  obtenerTodosLosUsuarios(): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
  
    this.http.get<any[]>('http://'+environment.host_back+'/users', { headers: headers })
      .subscribe(
        response => {
          console.log(response);
          this.usuarios = response;
        },
        error => {
          console.error('Error al obtener los usuarios', error);
          this.error = 'Error al obtener los usuarios';
      }
     );
  }

  filtrarUsuarios(): void {
    if (this.searchQuery) {
      this.filteredUsuarios = this.usuarios.filter(usuario => usuario.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()));
    } else {
      this.filteredUsuarios = this.usuarios;
    }
  }

  banearUsuario(usuario: any): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    this.http.patch('http://'+environment.host_back+'/user/ban', { id: usuario.id }, { headers: headers })
      .subscribe(
        response => {
          console.log(response);
          usuario.baneado = true;
        },
        error => {
          console.error('Error al banear el usuario', error);
          this.error = 'Error al banear el usuario';
      }
     );
  }

  desbanearUsuario(usuario: any): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    this.http.patch('http://'+environment.host_back+'/user/unban', { id: usuario.id }, { headers: headers })
      .subscribe(
        response => {
          console.log(response);
          usuario.baneado = false;
        },
        error => {
          console.error('Error al desbanear el usuario', error);
          this.error = 'Error al desbanear el usuario';
      }
     );
  }
}
