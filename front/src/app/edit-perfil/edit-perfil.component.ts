import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent {
  edades: number[] = Array.from({length: 82}, (_, i) => i + 18);
  mostrarContrasena = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  imagenPerfil = 'assets/Logo.png'; //Quiza aqui traer la de la BD

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
  
  
}
