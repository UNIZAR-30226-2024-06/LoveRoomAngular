import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  templateUrl: './youtube.component.html',
  styleUrl: './youtube.component.css'
})
export class YoutubeComponent {

  showResults = false;
  searchQuery: string = '';
  videos: any[] = [];
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) { }

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
    this.router.navigate(['/sala', videoId]);
  }
}
