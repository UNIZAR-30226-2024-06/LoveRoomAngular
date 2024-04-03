import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { routes } from '../app.routes';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  providers: [HttpClient],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  constructor(private http: HttpClient, private router: Router) { }

  login(correo: string, contrasena: string) {
    console.log('ENTRA')
    this.http.post<any>('http://localhost:5000/user/login', { correo, contrasena })
      .subscribe(
        response => {
          // Maneja la respuesta del backend
          if (response && response.token) {
            console.log('Inicio de sesión exitoso:', response.token);
            localStorage.setItem('token', response.token); // Almacena el token en el almacenamiento local
            // Redirige al usuario a la página principal o a donde sea necesario
            
          }
          this.router.navigate(['/registrarse']);
        },
        error => {
          this.router.navigate(['/registrarse']);
          // Maneja el error, por ejemplo, mostrando un mensaje de error al usuario
          console.error('Error en la solicitud de inicio de sesión:');
        }
      );
  }
}
