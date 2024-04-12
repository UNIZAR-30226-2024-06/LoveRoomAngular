import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ CabeceraYMenuComponent, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  usuario: any;
  error: string | undefined;

  constructor(private http: HttpClient) {
    const correo = localStorage.getItem('correo');
    if (correo !== null && correo !== undefined) {
    this.obtenerPerfilUsuario(correo);
    }
  }

  obtenerPerfilUsuario(correo: string): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    this.http.get<any>('http://localhost:5000/user/' + correo, { headers: headers })
      .subscribe(
        response => {
          if (response.error) {
            this.error = response.error;
          } else {
            this.usuario = response;
          }
        },
        error => {
          console.error('Error al obtener el perfil del usuario', error);
          this.error = 'Error al obtener el perfil del usuario';
        }
      );
  }
}