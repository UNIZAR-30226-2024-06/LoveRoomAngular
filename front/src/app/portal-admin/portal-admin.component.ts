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
  error: string='';
  public numTotal: number = 0;
  public chartSexo: any;
  public chartEdad: any;


  constructor(private http: HttpClient, private router: Router) { }

  async ngOnInit(): Promise<void> {
    await this.graficoSexo();
    await this.graficoEdad();
    //alert('Usuarios: ' + this.numHombres + ' Hombres, ' + this.numMujeres + ' Mujeres, ' + this.numOtro + ' Otros')
  }


  async graficoSexo(): Promise<void> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    let numHombres: number = 0;
    let numMujeres: number = 0;
    let numOtro: number = 0;
    
    try {
      const response = await this.http.get<any[]>('http://'+environment.host_back+'/users', { headers: headers }).toPromise();
      if (response) {
        response.forEach(usuario => {
          //alert('Usuario: ' + usuario.nombre + ' ' + usuario.apellido + ' ' + usuario.sexo)
          if (usuario.sexo == "H") {
            numHombres++;
          } else if (usuario.sexo == "M") {
            numMujeres++;
          } else if (usuario.sexo == "O"){
            numOtro++;
          }
        });
        this.numTotal = numHombres + numMujeres + numOtro;
      }
    }
    catch (error : any) {
      console.error('Error al obtener los usuarios', error);
      this.error = 'Error al obtener los usuarios';
      return;
    }
    
    this.chartSexo = new Chart("sexo", {
      type: 'pie', //this denotes the type of chart

      data: {// values on X-Axis
        labels: ['Hombres', 'Mujeres', 'Otro'], 
	       datasets: [{
          label: "Sexo",
          data: [numHombres, numMujeres, numOtro],
          backgroundColor: ['blue', 'red', 'limegreen']
         }]
      },
      options: {
        aspectRatio:2.5
      }
    });
  }

  async graficoEdad(): Promise<void> {

    let numAge18_25 = 0;  // 18 - 25
    let numAge26_35 = 0;  // 26 - 35
    let numAge36_45 = 0;  // 36 - 45
    let numAge46_55 = 0;  // 45 - 55
    let numAge55_65 = 0;  // 55-65
    let numAge66 = 0;     // 66+
    let headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    try {
      const response = await this.http.get<any[]>('http://'+environment.host_back+'/users', { headers: headers }).toPromise();
      if (response) {
        response.forEach(usuario => {
          if (usuario.edad >= 18 && usuario.edad <= 25) {
            numAge18_25++;
          } else if (usuario.edad >= 26 && usuario.edad <= 35) {
            numAge26_35++;
          } else if (usuario.edad >= 36 && usuario.edad <= 45) {
            numAge36_45++;
          } else if (usuario.edad >= 46 && usuario.edad <= 55) {
            numAge46_55++;
          } else if (usuario.edad >= 56 && usuario.edad <= 65) {
            numAge55_65++;
          } else if (usuario.edad >= 66) {
            numAge66++;
          }
        });
      }
    }
    catch (error : any) {
      console.error('Error al obtener la edad de los usuarios', error);
      this.error = 'Error al obtener los usuarios';
      return;
    }

    this.chartEdad = new Chart("edad", {
      type: 'bar',

      data: {
        labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '66+'], 
        datasets: [{
          label: "Edad",
          data: [numAge18_25, numAge26_35, numAge36_45, numAge46_55, numAge55_65, numAge66],
          backgroundColor: ['#F89F9F']
         }]
      },
      options: {
        aspectRatio:2.5
      }
    });

  }
}
