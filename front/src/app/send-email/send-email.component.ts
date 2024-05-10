import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-send-email',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  providers: [HttpClient],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css'
})


export class SendEmailComponent {
  correo: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  sendEmail(): void {
    const credentials = {
      correo: this.correo,
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>('http://'+environment.host_back+'/user/send/email', credentials, { headers: headers })
      .subscribe(
        response => {
          console.log('Correo enviado', this.correo);
        },
        error => {
          // Si hubo un error durante la autenticación, muestra una alerta con el mensaje de error.
          console.error('Error al autenticar', error);
          this.errorMessage = error.error.error;
        }
      );
  }
}
