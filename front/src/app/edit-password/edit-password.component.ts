import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-edit-password',
  standalone: true,
  imports: [RouterModule, RouterOutlet, FormsModule, CommonModule],
  templateUrl: './edit-password.component.html',
  styleUrl: './edit-password.component.css'
})
export class EditPasswordComponent {
  constructor(private http: HttpClient, private router: Router) {}
  nuevaContrasena: string='';
  antiguaContrasena: string='';
  error: string='';

  guardarCambios(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const passwords = {
      nuevaContrasena: this.nuevaContrasena,
      antiguaContrasena: this.antiguaContrasena,
    };
    
    this.http.patch<any>('http://'+environment.host_back+'/user/update/password', passwords, { headers: headers })
      .subscribe(
        response => {
          console.log('Autenticación exitosa', response);
          this.router.navigate(['/']);
        },
        error => {
          console.error('Error al autenticar', error);
          this.error = error.error.error;
        }
      );
  }
}
