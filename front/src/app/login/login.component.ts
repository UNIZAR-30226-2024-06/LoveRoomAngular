import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  providers: [HttpClient],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})


export class LoginComponent {
  correo: string = '';
  contrasena: string = '';
  errorMessage: string = '';

  mostrarContrasena = false;

  constructor(private http: HttpClient, private router: Router) { }

  login(): void {
    const credentials = {
      correo: this.correo,
      contrasena: this.contrasena
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>('http://'+environment.host_back+'/user/login', credentials, { headers: headers })
      .subscribe(
        response => {
          // Si la autenticación fue exitosa, muestra una alerta con el token.
          console.log('Autenticación exitosa', response);
          if (response.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', response.token);
            this.router.navigate(['/']);
          }
        },
        error => {
          // Si hubo un error durante la autenticación, muestra una alerta con el mensaje de error.
          console.error('Error al autenticar', error);
          this.errorMessage = error.error.error;
        }
      );
  }

  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }
}
