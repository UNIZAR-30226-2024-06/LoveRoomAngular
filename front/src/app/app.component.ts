import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CabeceraYMenuComponent } from './cabecera-y-menu/cabecera-y-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CabeceraYMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front';
}
