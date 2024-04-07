import { Component } from '@angular/core';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ CabeceraYMenuComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {

}
