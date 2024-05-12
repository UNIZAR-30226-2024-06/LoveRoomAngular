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
  idUser: string = '';
  tarjeta: string = '';
  CVV: string = '';
  fecha: string = '';
  cantidad: number = 9.99;
  errorMessage: string = '';
  successMessage: string = '';

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
          this.router.navigate(['/']);
        },
        error => {
          console.error('Error al borrar la cuenta', error.message);
          alert('Error al borrar la cuenta' + error.message);
        }
      );
  } 

  pagar(): void {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró un token en el almacenamiento local.');
      return;
    }

    if (!(/^\d{16}$/.test(this.tarjeta))){
      this.errorMessage = "Número de tarjeta no válido";
      return;
    }
    else if (!(/^\d{3}$/.test(this.CVV))){
      this.errorMessage = "Número de CVV no válido";
      return;
    }
    else if (!(/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.fecha))){
      this.errorMessage = "Fecha no válida";
      return;
    }

  
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
    });

    this.http.get<any>('http://'+environment.host_back+'/payment/client_token', { headers: headers })
      .subscribe(
        response => {
          this.idUser = response.clientToken;

          const credentials = {
            idUser: this.idUser,
            amount: this.cantidad,
            paymentMethodNonce: this.tarjeta,
          };

          this.http.post<any>('http://'+environment.host_back+'/payment/transaction', credentials, {headers: headers})
            .subscribe(
              response => {
                this.successMessage = "Pago realizado con éxito, disfrute de ser premium";
                this.errorMessage = '';
                localStorage.removeItem('admin');
              },
              error => {
                this.errorMessage = error.error.error;
              }
            );
        },
        error => {
          this.errorMessage = error.error.error;
        }
      );
    
  }
  
}