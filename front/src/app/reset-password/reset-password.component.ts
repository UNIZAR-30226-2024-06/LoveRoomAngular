import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SocketService } from '../../services/socket.service';
import { socketEvents } from '../../environments/socketEvents';


@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  //providers: [SocketService], Comentado para asegurar patron Singleton del servicio, en caso de que el servicio no funcione descomentar esto primero
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  correo: string = '';
  codigo: string = '';
  contrasena: string = '';
  repetirContrasena: string = '';
  errorMessage: string = '';
  mostrarContrasena = false;
  mostrarContrasenaRepetida = false;

  constructor(private http: HttpClient, private router: Router, private socketService: SocketService) { 
    this.correo = localStorage.getItem('correo') as string;
    this.codigo = localStorage.getItem('codigo') as string;
  }

  resetPassword() {
    const credentials = {
      correo: this.correo,
      nuevaContrasena: this.contrasena,
      codigo: this.codigo,
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (!(/[A-Z]/.test(this.contrasena))){
      this.errorMessage = 'La contraseña debe contener al menos una letra mayúscula';
      return;
    }
    else if (!(/[a-z]/.test(this.contrasena))){
      this.errorMessage = 'La contraseña debe contener al menos una letra minúscula';
      return;
    }
    else if (!(/\d/.test(this.contrasena))){
      this.errorMessage = 'La contraseña debe contener al menos un número';
      return;
    }
    else if (8 > this.contrasena.length || this.contrasena.length > 16){
      this.errorMessage = 'La contraseña debe tener entre 8 y 16 caracteres';
      return;
    }
    else if (this.contrasena != this.repetirContrasena){
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.http.patch<any>('http://'+environment.host_back+'/user/reset/password', credentials, { headers: headers })
      .subscribe(
        response => {
          // Si la autenticación fue exitosa, muestra una alerta con el token.
          console.log('Contraseña restablecida con exito', response);
          if (response.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', response.token);
            if (response.usuario.tipousuario == "administrador"){
              localStorage.setItem('admin', 'true');
            }
            localStorage.removeItem('correo');
            localStorage.removeItem('codigo');
            this.router.navigate(['/']);
          }
        },
        error => {
          // Si hubo un error durante la autenticación, muestra una alerta con el mensaje de error.
          console.error('Error de conexion al restablecer la contraseña', error);
          this.errorMessage = error.error.error;
        }
      );
  }

  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarContrasenaRepetida() {
    this.mostrarContrasenaRepetida = !this.mostrarContrasenaRepetida;
  }
}