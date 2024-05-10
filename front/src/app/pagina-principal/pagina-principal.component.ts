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
import { map } from 'rxjs';

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
          this.salasInterest.forEach(sala => {
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
          console.error('Error al obtener los videos de interés:', error);
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

  watchVideo(videoId: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.socketService.connect();
    // Hacer la solicitud HTTP POST al backend
    this.http.post(`http://`+environment.host_back+`/videos/watch/${videoId}`, {}, { headers: headers }).subscribe(
      (response: any) => {
        // Manejar la respuesta del backend aquí
        console.log(headers);
        console.log(response);
        // Navegar a la sala después de la verificación del backend

        // En sala unitaria : redirige /videos/watch/idVideo
        // En sala no unitaria : /rooms/idSala

         // /sala/idSala
        //alert(response.esSalaUnitaria);
        // Emitir el evento emitMatch para asegurarnos de iniciar el proceso de matching
        //this.socketService.emitEvent(socketEvents.MATCH, { videoId: videoId });
        localStorage.setItem('Sala', response.esSalaUnitaria);
        if(response.esSalaUnitaria == true) {
          //alert('Sala unitaria, esperando match...');
          this.router.navigate(['/sala', videoId]);
          //alert('Esperando match...');
          // Escuchar el evento MATCH. Este evento se espera que sea emitido por el servidor cuando otro usuario
          // se una a la misma sala, lo cual constituiría un "match".
          this.socketService.onMatchEvent(socketEvents.MATCH).subscribe({
            next: (data) => {
              //alert(data.idSala);
              localStorage.setItem('Sala', response.esSalaUnitaria);
              this.router.navigate(['/sala', data.idSala]);
              console.log('Match event received:', data);
              console.log(`Match confirmed between senderId: ${data.senderId} and receiverId: ${data.receiverId} in room: ${data.idSala}`);
                // Additional logic to handle room joining or video control could be placed here
              this.socketService.emitEvent(socketEvents.JOIN_ROOM, data.idSala );
              //alert('Evento JOIN_ROOM emitido hacia el servidor con roomId:'); // Aviso después de hacer el emit.
            },
            error: (err) => console.error(err),
            complete: () => console.log('Finished listening to MATCH events')
          }); 
        } else {
          //alert(response.idsala);
          localStorage.setItem('videoId', videoId);
          this.router.navigate(['/sala', response.idsala]);
          // En el caso que la sala no sea unitaria desde el inicio (lo que implica que hay al menos otro
          // usuario ya presente en la sala), se emite directamente el evento JOIN_ROOM.
          //alert('Sala no es unitaria, match inicial encontrado.');
          // Emitir el evento JOIN_ROOM inmediatamente con el 'roomId' proporcionado en la respuesta del servidor.
          // Esto se hace porque no es necesario esperar a que otro usuario se una; el match ya existe.
          this.socketService.emitEvent(socketEvents.JOIN_ROOM, response.idsala );
          //alert('Evento JOIN_ROOM emitido inmediatamente con roomId');
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
