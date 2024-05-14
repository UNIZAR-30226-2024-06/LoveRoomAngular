import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';

@Component({
  selector: 'app-reports-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule, CabeceraYMenuComponent],
  templateUrl: './reports-admin.component.html',
  styleUrls: ['./reports-admin.component.css']
})
export class ReportsAdminComponent {
  reportes: any[] = [];
  error: string = '';
  filteredReportes: any[] = [];
  searchQuery: string = '';

  constructor(private http: HttpClient, private router: Router) {
    this.obtenerTodosLosReportes();
  }

  obtenerTodosLosReportes(): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    
    this.http.get<any[]>('http://'+environment.host_back+'/reports', { headers: headers })
      .subscribe(
        response => {
          this.reportes = response.map(reporte => ({ ...reporte, correo: undefined }));
          this.filteredReportes = [...this.reportes];
          this.reportes.forEach(reporte => this.obtenerCorreo(reporte.idusuario));
        },
        error => {
          console.error('Error al obtener los reportes', error);
          this.error = 'Error al obtener los reportes';
        }
     );
  }

  obtenerCorreo(idUsuario: number): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    
    this.http.get<{correo: string}>('http://'+environment.host_back+'/user/' + idUsuario + '/email', { headers: headers })
      .subscribe(
        response => {
          // Actualizar todos los reportes del mismo usuario
          this.reportes.forEach(reporte => {
            if (reporte.idusuario === idUsuario) {
              reporte.correo = response.correo;
            }
          });
          this.filteredReportes = [...this.reportes];
        },
        error => {
          console.error(`Error al obtener el correo del usuario ${idUsuario}`, error);
          this.error = `Error al obtener el correo del usuario ${idUsuario}`;
        }
     );
  }

  filtrarReportes(): void {
    if (this.searchQuery) {
      this.filteredReportes = this.reportes.filter(reporte =>
        reporte.correo && reporte.correo.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredReportes = [...this.reportes];
    }
  }

  resolverReporte(idReporte: number, ban: boolean): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    const credentials = {
      banUser: ban
    };

    this.http.patch('http://' + environment.host_back + '/reports/' + idReporte + '/resolve', credentials, { headers: headers })
      .subscribe({
        next: response => {
          console.log(response);
          this.obtenerTodosLosReportes(); // Refresh reportes
        },
        error: error => {
          console.error('Error al resolver el reporte', error);
          this.error = 'Error al resolver el reporte';
        }
      });
  }

  eliminarReporte(idReporte: number): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    this.http.delete('http://' + environment.host_back + '/reports/' + idReporte, { headers: headers })
      .subscribe({
        next: response => {
          console.log(response);
          this.obtenerTodosLosReportes(); // Refresh reportes
        },
        error: error => {
          console.error('Error al eliminar el reporte', error);
          this.error = 'Error al eliminar el reporte';
        }
      });
  }
}
