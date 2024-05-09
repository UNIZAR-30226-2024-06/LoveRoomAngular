import { Component, ViewChild, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { SocketService } from '../../services/socket.service';
import { RouterOutlet } from "@angular/router";
import { environment } from '../../environments/environment';
import io from 'socket.io-client';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-prueba-socket',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './prueba-socket.component.html',
  styleUrl: './prueba-socket.component.css'
})


export class PruebaSocketComponent implements OnInit{
  socket = io(`http://${environment.host_back}`, {
    auth: {
      token: `Bearer ${localStorage.getItem('token')}`
    }
  });
  //private socketService = inject(SocketService);
  //chartPacientesPorGenero: any;
  //pacientesPorGeneroOptions!: any;

  constructor() {}

  ngOnInit(): void {
    try {
      this.socket.on('connect', () => {
        alert("Conectado");
      });
    } catch (error) {
      alert("Va al catch");
    }
  }

  /*ngOnInit(): void {
    // Suscribirse al evento 'datos'
    this.socketService.getDatosPacientes().subscribe((data: any) => {
      console.log("Datos de pacientes recibidos:", data);
      // Aquí puedes manejar los datos recibidos según tus necesidades
    });
    this.socketService.getPacientesPorGenero().subscribe(data: => {
      console.log('Datos de pacientes por género:', data);
      // Procesar los datos recibidos para Highcharts
      const formattedData = data.map((item: any) => ({
        name: item.genero === "F" ? "Femenino" : "Masculino",
        y: item.TotalPacientes
      }));
      
      this.pacientesPorGeneroOptions = {
        title: {
          text: 'Pacientes por Género',
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.y}',
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Total Pacientes',
          data: formattedData
        }]
      };
    });
  }*/
}
