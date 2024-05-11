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
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})


export class VerifyCodeComponent {
  correo: string = '';
  codigo: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) { 
    this.correo = localStorage.getItem('correo') as string;
  }

  verifyCode(): void {
    const credentials = {
      correo: this.correo,
      codigo: this.codigo
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>('http://'+environment.host_back+'/user/check/code', credentials, { headers: headers })
      .subscribe(
        response => {
          if (response.valido == false) {
            this.errorMessage = 'error.error.error';
            return;
          }
          else if (response.valido == true){
            localStorage.setItem('correo', this.correo);
            localStorage.setItem('codigo', this.codigo);
            this.router.navigate(['/reset-password']);
          }
          
        },
        error => {
          // Si hubo un error durante la autenticación, muestra una alerta con el mensaje de error.
          console.error('Error:', error.error.error);
          this.errorMessage = error.error.error;
        }
      );
  }
}
