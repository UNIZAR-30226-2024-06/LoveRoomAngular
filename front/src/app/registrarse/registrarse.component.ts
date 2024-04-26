import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  providers: [HttpClient],
  templateUrl: './registrarse.component.html',
  styleUrl: './registrarse.component.css',
})
export class RegistrarseComponent {
  correo: string = '';
  nombre: string = '';
  contrasena: string = '';
  contrasenaConfirm: string = '';
  errorMsg: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  registrarse(): void {
    if (this.contrasena !== this.contrasenaConfirm) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    const credentials = {
      correo: this.correo,
      nombre: this.nombre,
      contrasena: this.contrasena
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>('http://'+environment.host_back+'/user/create', credentials, { headers: headers })
      .subscribe(
        response => {
          // Si la autenticación fue exitosa, muestra una alerta con el token.
          console.log('Creación de cuenta exitosa', response);
          if (response.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', response.token);
            alert('¡Creación de cuenta exitosa! Token: ' + response.token);
            this.router.navigate(['/']);
          }
        },
        error => {
          console.error('Error al crear la cuenta', error);
        }
      );
  }
}
