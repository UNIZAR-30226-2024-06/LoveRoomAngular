import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule, CabeceraYMenuComponent, BarChartComponent],
  templateUrl: './portal-admin.component.html',
  styleUrl: './portal-admin.component.css'
})
export class PortalAdminComponent {
  imagenPerfil = 'assets/Logo.png'; //Quiza aqui traer la de la BD
  usuarios: any[] = [];
  error: string='';
  filteredUsuarios: any[] = [];
  searchQuery: string = '';
  numHombres: number = 0;
  numMujeres: number = 0;
  numOtro: number = 0;
  publicchart: any;
  public chart: any;


  constructor(private http: HttpClient, private router: Router) { }

  async ngOnInit(): Promise<void> {
    await this.graficoSexo();
    //alert('Usuarios: ' + this.numHombres + ' Hombres, ' + this.numMujeres + ' Mujeres, ' + this.numOtro + ' Otros')
  }


  async graficoSexo(): Promise<void> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    
    try {
      const response = await this.http.get<any[]>('http://'+environment.host_back+'/users', { headers: headers }).toPromise();
      if (response) {
        response.forEach(usuario => {
          //alert('Usuario: ' + usuario.nombre + ' ' + usuario.apellido + ' ' + usuario.sexo)
          if (usuario.sexo == "H") {
            this.numHombres++;
          } else if (usuario.sexo == "M") {
            this.numMujeres++;
          } else if (usuario.sexo == "O"){
            this.numOtro++;
          }
        });
      }
    }
    catch (error : any) {
      console.error('Error al obtener los usuarios', error);
      this.error = 'Error al obtener los usuarios';
    }
    
    this.chart = new Chart("sexo", {
      type: 'pie', //this denotes the type of chart

      data: {// values on X-Axis
        labels: ['Hombres', 'Mujeres', 'Otro'], 
	       datasets: [{
          label: "Sexo",
          data: [this.numHombres, this.numMujeres, this.numOtro],
          backgroundColor: ['blue', 'red', 'limegreen']
         }]
      },
      options: {
        aspectRatio:2.5
      }
    });
  }
}
