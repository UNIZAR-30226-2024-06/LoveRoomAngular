import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-perfil',
  standalone: true,
  imports: [],
  templateUrl: './edit-perfil.component.html',
  styleUrl: './edit-perfil.component.css'
})
export class EditPerfilComponent {
  edades: number[] = Array.from({length: 82}, (_, i) => i + 18);
  mostrarContrasena = false;

  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }
}
