import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
  
}
