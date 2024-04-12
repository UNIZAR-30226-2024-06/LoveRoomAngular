import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent {
  edades: number[] = Array.from({length: 82}, (_, i) => i + 18);
  mostrarContrasena = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  imagenPerfil = 'assets/Logo.png'; //Quiza aqui traer la de la BD
  router: any;

  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  

  cambiarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPerfil = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  
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

  usuarioActualizado: any = {}; // Nuevo objeto para almacenar los cambios antes de enviarlos al servidor

  actualizarUsuario(): void {
    // Actualizar el objeto usuarioActualizado con los valores del formulario
    this.usuarioActualizado = {
      nombre: this.usuario.nombre,
      contrasena: this.usuario.contrasena,
      edad: this.usuario.edad,
      sexo: this.usuario.sexo,
      buscaedadmin: this.usuario.buscaedadmin,
      buscaedadmax: this.usuario.buscaedadmax,
      buscasexo: this.usuario.buscasexo,
      descripcion: this.usuario.descripcion,
      fotoperfil: this.usuario.fotoperfil,
      idlocalidad: this.usuario.idlocalidad,
      correo: this.usuario.correo
    };
  }

  guardarCambios(): void {
    // Actualizar el objeto usuario con los cambios antes de enviarlos al servidor
    this.actualizarUsuario();

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    const body = this.usuario; // Enviar el objeto usuarioActualizado al backend

    this.http.post<any>('http://localhost:5000/update-user', body, { headers: headers })
      .subscribe(
        response => {
          if (response.message) {
            alert('Usuario actualizado correctamente');
            this.router.navigate(['/']);
          } else {
            alert('Error al actualizar el usuario');
          }
        },
        error => {
          console.error('Error al actualizar el usuario', error);
          alert('Error al actualizar el usuario: ' + error.message);
        }
      );
  }
}
