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
  //providers: [SocketService], Comentado para asegurar patron Singleton del servicio, en caso de que el servicio no funcione descomentar esto primero
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
    this.socketService.connect();
    // Hacer la solicitud HTTP POST al backend
    this.http.post(`http://`+environment.host_back+`/videos/watch/${videoId}`, {}, { headers: headers }).subscribe(
      (response: any) => {
        console.log(headers);
        localStorage.setItem('videoId', videoId);
        if(response.esSalaUnitaria == true) {
          this.router.navigate(['/salaUnitaria', videoId]);
          this.socketService.onMatchEvent(socketEvents.MATCH).subscribe({
            next: (data) => {
              this.router.navigate(['/sala', data.idSala]);
              console.log('Match event received:', data);
              console.log(`Match confirmed between senderId: ${data.senderId} and receiverId: ${data.receiverId} in room: ${data.idSala}`);
            },
            error: (err) => console.error(err),
            complete: () => console.log('Finished listening to MATCH events')
          }); 
        } else {
          this.router.navigate(['/sala', response.idsala]);
        }
      },
      (error: any) => {
        console.error(error);
        this.errorMessage = error.error.error;
      }
    );
  }
}