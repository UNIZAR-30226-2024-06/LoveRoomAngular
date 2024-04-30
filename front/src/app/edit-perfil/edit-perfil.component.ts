import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent {
  edades: number[] = Array.from({length: 82}, (_, i) => i + 18);
  mostrarContrasena = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  imagenPerfil = 'assets/Logo.png'; //Quiza aqui traer la de la BD
  usuario: any;
  error: string='';
  flag_imagen = false;
  file: any;

  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  actualizarEdadMaxima() {
    if (this.usuario.buscaedadmin > this.usuario.buscaedadmax) this.usuario.buscaedadmax = this.usuario.buscaedadmin;
  }

  actualizarEdadMinima() {
    if (this.usuario.buscaedadmin > this.usuario.buscaedadmax) this.usuario.buscaedadmin = this.usuario.buscaedadmax;
  }


  cambiarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPerfil = reader.result as string;
      };
      reader.readAsDataURL(this.file);
      this.flag_imagen = true;
    }
  }

  constructor(private http: HttpClient, private router: Router) {
    this.obtenerPerfilUsuario();
  }

  obtenerPerfilUsuario(): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
  
    this.http.get<any>('http://'+environment.host_back+'/user/profile', { headers: headers })
      .subscribe(
        response => {
          console.log(response);
          this.usuario = response;
          this.imagenPerfil = this.usuario.fotoperfil === 'null.jpg' ? this.imagenPerfil : this.usuario.fotoperfil;
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
    correo: this.usuario.correo,
    nombre: this.usuario.nombre,
    edad: parseInt(this.usuario.edad, 10),
    sexo: this.usuario.sexo,
    buscaedadmin: parseInt(this.usuario.buscaedadmin, 10),
    buscaedadmax: parseInt(this.usuario.buscaedadmax, 10),
    buscasexo: this.usuario.buscasexo,
    descripcion: this.usuario.descripcion,
    fotoperfil: this.usuario.fotoperfil,
    idlocalidad: parseInt(this.usuario.idlocalidad, 10),
    };
  }

  guardarCambios(): void {
    // Actualizar el objeto usuario con los cambios antes de enviarlos al servidor
    this.actualizarUsuario();

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    const token = localStorage.getItem('token');

    const body = this.usuarioActualizado; // Enviar el objeto usuarioActualizado al backend
    console.log(body);

    console.log(this.file);
    if (this.flag_imagen == true) {
      this.http.post<any>('http://'+environment.host_back+'/multimedia/upload/foto/${token}', this.file, { headers: headers })
      .subscribe(
        response => {
          console.log('Imagen subida', response);
          alert("Imagen subida");
          this.usuarioActualizado.fotoperfil = response;
        },
        error => {
          console.error('Error al subir la imagen', error.message);
          this.error = error.error.error;
          alert(error.message);
        }
      );
    }    

    this.http.put<any>('http://'+environment.host_back+'/user/update', body, { headers: headers })
      .subscribe(
        response => {
          console.log('Usuario actualizado', response);
          this.router.navigate(['/']);
        },
        error => {
          console.error('Error al actualizar el usuario', error.message);
          this.error = error.error.error;
        }
      );
  }
}
