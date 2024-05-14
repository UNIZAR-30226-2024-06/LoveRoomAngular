import { Component, OnInit } from '@angular/core';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { socketEvents } from '../../environments/socketEvents';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-salas',
  standalone: true,
  imports: [CabeceraYMenuComponent, CommonModule, FormsModule],
  templateUrl: './mis-salas.component.html',
  styleUrl: './mis-salas.component.css'
})


export class MisSalasComponent implements OnInit {
  salas: any[] = []; // Aquí almacenaremos las salas obtenidas del backend

  constructor(private http: HttpClient, private router: Router, private sanitizer: DomSanitizer, private socketService: SocketService) { }

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
    this.http.get<any[]>('http://'+environment.host_back+'/rooms', { headers })
      .subscribe(
        (response) => {
          // Éxito: asignamos la respuesta (lista de salas) a nuestra variable 'salas'
          this.salas = response;
          this.salas.forEach(sala => {
            // Obtenemos el título del video de YouTube
            this.getVideoTitle(sala.idvideo).subscribe(
              (title: string) => {
                sala.videoTitle = title;
              },
              (error) => {
                console.error('Error al obtener el título del video:', error);
              }
            );

            this.getAuthor(sala.idvideo).subscribe(
              (autor: string) => {
                sala.autor = autor;
              },
              (error) => {
                console.error('Error al obtener el autor del video:', error);
              }
            );
          });
        },
        (error) => {
          // Manejo de errores
          console.error('Error al obtener las salas:', error);
        }
      );
  }

  getVideoTitle(videoId: string) {
    const apiKey = environment.apiKey;
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoId}`;
    return this.http.get(url).pipe(
      map((data: any) => {
        return data.items[0].snippet.title;
      })
    );
  }

  getAuthor(videoId: string) {
    const apiKey = environment.apiKey;
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoId}`;
    return this.http.get(url).pipe(
      map((data: any) => {
        return data.items[0].snippet.channelTitle;
      })
    );
  }
  
  getVideoThumbnailUrl(videoId: string): SafeResourceUrl {
    // Creamos la URL de la miniatura del video de YouTube y la pasamos a través de DomSanitizer
    const url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  watchVideo(salaId: string, videoId: string) {
    localStorage.setItem('videoId', videoId);
    this.socketService.connect();
    this.router.navigate(['/sala', salaId]);
    this.socketService.emitJoinLeave(socketEvents.JOIN_ROOM, salaId);
  }

  deleteRoom(salaId: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.http.delete(`http://${environment.host_back}/rooms/${salaId}`, { headers })
      .subscribe(
        (response) => {
          console.log('Sala eliminada:', response);
          this.getSalas();
        },
        (error) => {
          console.error('Error al eliminar la sala:', error);
        }
      );
  }

  updateRoom(salaId: string, nombreSala: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.http.put(`http://${environment.host_back}/rooms/${salaId}/rename`, { nombreSala }, { headers })
      .subscribe(
        (response) => {
          console.log('Nombre de sala actualizado:', response);
          this.getSalas();
        },
        (error) => {
          console.error('Error al actualizar el nombre de la sala:', error);
        }
      );
  }
}
