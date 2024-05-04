import { Component, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterOutlet, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SocketService } from '../../services/socket.service';


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

  // En el constructor o en algún método de inicialización
constructor(private http: HttpClient, private router: Router, private SocketService: SocketService) {
  // Preparar la suscripción
  this.setupSocketListeners();
}

private setupSocketListeners() {
  this.SocketService.getSocketState().subscribe(state => {
    if (state.idSala && state.idSala !== '') {
      // Asegurarse de navegar y unirse solo si se recibe el MATCH
      this.router.navigate(['/sala', state.idSala]);
      this.SocketService.send({ type: 'JOIN_ROOM', idSala: state.idSala });
    }
  });
}


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
    this.http.post(`http://${environment.host_back}/videos/watch/${videoId}`, {}, { headers: headers }).subscribe({
      next: (response: any) => {
        console.log('Response:', response);
        // Si es una sala unitaria, nos quedamos escuchando
        if (response.esSalaUnitaria) {
          this.router.navigate(['/sala', videoId]);  // Ver el video en sala unitaria
          // Escuchar el evento MATCH
          this.SocketService.getSocketState().subscribe(state => {
            if (state.idSala && state.idSala !== '') {
              this.SocketService.send({ type: 'JOIN_ROOM', idSala: state.idSala });
            }
          });
        } else {
          // No es una sala unitaria, emitir inmediatamente JOIN_ROOM
          this.router.navigate(['/sala', response.idSala]);
          this.SocketService.send({ type: 'JOIN_ROOM', idSala: response.idSala });
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.errorMessage = error.error.error || 'Error desconocido al intentar ver el video';
        if (error.status === 403) {
          alert("El usuario ha sobrepasado su límite de salas");
        } else if (error.status === 500) {
          alert("Error al ver video");
        }
      }
    });
  }
  
}
