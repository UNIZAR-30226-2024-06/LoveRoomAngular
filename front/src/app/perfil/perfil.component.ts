import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ CabeceraYMenuComponent, RouterOutlet, RouterModule, FormsModule, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  usuario: any;
  error: string | undefined;
  showAnswer: boolean[] = [];

  constructor(private http: HttpClient, private router: Router) {
    const correo = localStorage.getItem('correo');
    if (correo !== null && correo !== undefined) {
    this.obtenerPerfilUsuario(correo);
    }
  }

  obtenerPerfilUsuario(correo: string): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    this.http.get<any>('http://'+environment.host_back+'/user/' + correo, { headers: headers })
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

  toggleAnswer(index: number): void {
    // Cambiar el estado de la respuesta correspondiente al índice
    this.showAnswer[index] = !this.showAnswer[index];

    // Ocultar las demás respuestas
    for (let i = 0; i < this.showAnswer.length; i++) {
      if (i !== index) {
        this.showAnswer[i] = false;
      }
    }
  }

  logout(): void {
    // Verificar si estamos en el navegador antes de intentar acceder a localStorage
    if (typeof window !== 'undefined') {
      // Eliminar el token del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.reload();
    }
  }

  token: string = '';

  borrar(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró un token en el almacenamiento local.');
      alert('No se encontró un token en el almacenamiento local.');
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });
    
    this.http.delete<any>('http://'+environment.host_back+'/user/delete', { headers: headers })
      .subscribe(
        response => {
          // Si la autenticación fue exitosa, muestra una alerta con el token.
          console.log('Se ha borrado la cuenta', response);
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          alert('¡Eliminación de cuenta exitosa!');
          this.router.navigate(['/']);
        },
        error => {
          console.error('Error al borrar la cuenta', error.message);
          alert('Error al borrar la cuenta' + error.message);
        }
      );
  }
  
}