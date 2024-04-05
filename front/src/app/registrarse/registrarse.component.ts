import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule],
  providers: [HttpClient],
  templateUrl: './registrarse.component.html',
  styleUrl: './registrarse.component.css'
})
export class RegistrarseComponent {
  correo: string = '';
  nombre: string = '';
  contrasena: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  registrarse(): void {
    const credentials = {
      correo: this.correo,
      nombre: this.nombre,
      contrasena: this.contrasena
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>('http://localhost:5000/user/create', credentials, { headers: headers })
      .subscribe(
        response => {
          // Si la autenticación fue exitosa, muestra una alerta con el token.
          console.log('Creación de cuenta exitosa', response);
          if (response.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', response.token);
            alert('¡Creación de cuenta exitosa! Token: ' + response.token);
            this.router.navigate(['/']);
          } else {
            alert('Error: No se recibió token en la respuesta.');
          }
        },
        error => {
          // Si hubo un error durante la autenticación, muestra una alerta con el mensaje de error.
          console.error('Error al crear cuenta', error);
          alert('Error al crear cuenta: ' + error.message);
          this.router.navigate(['/mis-salas']);
        }
      );
  }
}
