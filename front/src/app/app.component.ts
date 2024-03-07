import { Component } from '@angular/core';
import { CabeceraYMenuComponent } from './cabecera-y-menu/cabecera-y-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CabeceraYMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front';
  
}
