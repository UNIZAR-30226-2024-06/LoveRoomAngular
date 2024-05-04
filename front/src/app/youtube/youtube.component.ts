import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SocketService } from '../../services/socket.service';
import { socketEvents } from '../../environments/socketEvents';


@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  providers: [SocketService],
  templateUrl: './youtube.component.html',
  styleUrl: './youtube.component.css'
})
export class YoutubeComponent {

  showResults = false;
  searchQuery: string = '';
  videos: any[] = [];
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private socketService: SocketService) { }

  toggleResults() {
    this.showResults = !this.showResults;
  }

  searchVideos() {
    if (this.searchQuery.trim() === '') {
      this.errorMessage = 'No ha escrito nada para su búsqueda';
      return;
    }
    this.errorMessage = '';
    const apiKey = environment.apiKey;
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${this.searchQuery}&maxResults=50`;

    this.http.get(apiUrl).subscribe((data: any) => {
      this.videos = data.items;
      this.showResults = true;
    });
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
        this.socketService.onEvent(socketEvents.MATCH).subscribe({
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