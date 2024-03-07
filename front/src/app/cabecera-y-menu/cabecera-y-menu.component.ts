import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cabecera-y-menu',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './cabecera-y-menu.component.html',
  styleUrl: './cabecera-y-menu.component.css'
})
export class CabeceraYMenuComponent {

}
