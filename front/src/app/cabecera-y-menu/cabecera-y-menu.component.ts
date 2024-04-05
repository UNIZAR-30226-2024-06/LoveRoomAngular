import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cabecera-y-menu',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './cabecera-y-menu.component.html',
  styleUrl: './cabecera-y-menu.component.css'
})
export class CabeceraYMenuComponent {

  token: string | null = null;

  constructor() {
    // Verificar si estamos en el navegador antes de intentar acceder a localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  logout(): void {
    // Verificar si estamos en el navegador antes de intentar acceder a localStorage
    if (typeof window !== 'undefined') {
      // Eliminar el token del localStorage
      localStorage.removeItem('token');
      window.location.reload();
    }
  }
}
