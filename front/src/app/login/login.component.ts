import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterModule, HttpClientModule],
  providers: [HttpClient],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    this.http.post<any>('http://localhost:3000/user/login', { username, password })
      .subscribe(response => {
        // Maneja la respuesta del backend
        if (response && response.token) {
          localStorage.setItem('token', response.token); // Almacena el token en el almacenamiento local
          // Redirige al usuario a la página principal o a donde sea necesario
        }
      });
  }
}
