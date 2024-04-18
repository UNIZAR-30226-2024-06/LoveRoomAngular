import { Component, OnInit } from '@angular/core';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-mis-salas',
  standalone: true,
  imports: [CabeceraYMenuComponent, CommonModule],
  templateUrl: './mis-salas.component.html',
  styleUrl: './mis-salas.component.css'
})


export class MisSalasComponent implements OnInit {
  salas: any[] = []; // Aquí almacenaremos las salas obtenidas del backend

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // Llamada al backend para obtener la lista de salas
    this.getSalas();
  }

  getSalas() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Llamada HTTP GET al backend para obtener las salas
    this.http.get<any[]>('http://localhost:5000/rooms', { headers })
      .subscribe(
        (response) => {
          // Éxito: asignamos la respuesta (lista de salas) a nuestra variable 'salas'
          this.salas = response;
        },
        (error) => {
          // Manejo de errores
          console.error('Error al obtener las salas:', error);
        }
      );
  }
  
  getVideoThumbnailUrl(videoId: string): SafeResourceUrl {
    // Creamos la URL de la miniatura del video de YouTube y la pasamos a través de DomSanitizer
    const url = `https://img.youtube.com/vi/${videoId}/default.jpg`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
