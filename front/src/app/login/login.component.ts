import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule],
  providers: [HttpClient],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})


export class LoginComponent {
  correo: string = '';
  contrasena: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  login(): void {
    const credentials = {
      correo: this.correo,
      contrasena: this.contrasena
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>('http://localhost:5000/user/login', credentials, { headers: headers })
      .subscribe(
        response => {
          // Si la autenticación fue exitosa, muestra una alerta con el token.
          console.log('Autenticación exitosa', response);
          if (response.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', response.token);
            alert('¡Inicio de sesión exitoso! Token: ' + response.token);
            this.router.navigate(['/']);
          } else {
            alert('Error: No se recibió token en la respuesta.');
          }
        },
        error => {
          // Si hubo un error durante la autenticación, muestra una alerta con el mensaje de error.
          console.error('Error al autenticar', error);
          alert('Error al iniciar sesión: ' + error.message);
          this.router.navigate(['/mis-salas']);
        }
      );
  }
}
