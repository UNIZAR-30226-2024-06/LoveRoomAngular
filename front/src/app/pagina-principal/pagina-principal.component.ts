import { Component, OnInit } from '@angular/core';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { YoutubeComponent } from '../youtube/youtube.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { socketEvents } from '../../environments/socketEvents';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CabeceraYMenuComponent, YoutubeComponent, CommonModule],
  providers: [SocketService],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css'
})
export class PaginaPrincipalComponent implements OnInit{
  salasInterest: any[] = [];
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private sanitizer: DomSanitizer, private socketService: SocketService) { }

  ngOnInit(): void {
    this.getSalasInterest();
  }

  getSalasInterest() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>('http://'+environment.host_back+'/videos/interest', { headers })
      .subscribe(
        (response) => {
          this.salasInterest = response;
        },
        (error) => {
          console.error('Error al obtener los videos de interés:', error);
        }
      );
  }

  getVideoTitle(videoId: string) {
    const apiKey = environment.apiKey;
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoId}`;
    return this.http.get(url);
  }
  
  getVideoThumbnailUrl(videoId: string): SafeResourceUrl {
    // Creamos la URL de la miniatura del video de YouTube y la pasamos a través de DomSanitizer
    const url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  watchVideo(videoId: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Hacer la solicitud HTTP POST al backend
    this.http.post(`http://`+environment.host_back+`/videos/watch/${videoId}`, {}, { headers: headers }).subscribe(
      (response: any) => {
        // Manejar la respuesta del backend aquí
        console.log(headers);
        console.log(response);
        // Navegar a la sala después de la verificación del backend
        this.router.navigate(['/sala', videoId]);
        alert(response.esSalaUnitaria);
        if(response.esSalaUnitaria == true) {
          alert('Esperando match...');
          // Escuchar el evento MATCH. Este evento se espera que sea emitido por el servidor cuando otro usuario
          // se una a la misma sala, lo cual constituiría un "match".
        this.socketService.listen(socketEvents.MATCH).subscribe({
          next: (data) => {
            alert('Evento MATCH recibido, data:'); // Aviso cuando llegue algo en la escucha.
            // En el momento que se recibe el evento MATCH, este bloque se ejecuta. 'data' debería contener
            // información relevante enviada por el servidor, como el 'roomId' de la sala donde ambos usuarios
            // están ahora emparejados.
            
            // Emitir el evento JOIN_ROOM hacia el servidor, pasando el 'roomId' recibido.
            // Esto le indica al servidor que el usuario actual se está uniendo formalmente a la sala
            // donde ha ocurrido el match.
            this.socketService.emitEvent(socketEvents.JOIN_ROOM, { roomId: data.roomId });
            alert('Evento JOIN_ROOM emitido hacia el servidor con roomId:'); // Aviso después de hacer el emit.
            
          }
        });
      } else {
        // En el caso que la sala no sea unitaria desde el inicio (lo que implica que hay al menos otro
        // usuario ya presente en la sala), se emite directamente el evento JOIN_ROOM.
        alert('Sala no es unitaria, match inicial encontrado.');
        // Emitir el evento JOIN_ROOM inmediatamente con el 'roomId' proporcionado en la respuesta del servidor.
        // Esto se hace porque no es necesario esperar a que otro usuario se una; el match ya existe.
        this.socketService.emitEvent(socketEvents.JOIN_ROOM, { roomId: response.roomId });
        alert('Evento JOIN_ROOM emitido inmediatamente con roomId');
        }
      },
      (error: any) => {
        // Manejar errores aquí
        console.error(error);
        this.errorMessage = error.error.error;
      }
    );
  }
}
