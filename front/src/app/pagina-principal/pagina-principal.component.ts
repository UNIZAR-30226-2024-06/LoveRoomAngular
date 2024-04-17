import { Component } from '@angular/core';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { YoutubeComponent } from '../youtube/youtube.component';
@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CabeceraYMenuComponent, YoutubeComponent],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css'
})
export class PaginaPrincipalComponent {

}
