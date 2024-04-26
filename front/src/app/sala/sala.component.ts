import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
import { YouTubePlayerComponent } from '../youtube-player/youtube-player.component';
import { YoutubeComponent } from '../youtube/youtube.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { SocketService } from '../../services/socket.service';
import { socketEvents } from '../../environments/socketEvents';
import { Subscription } from 'rxjs';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CabeceraYMenuComponent, YoutubeComponent, CommonModule, FormsModule, RouterOutlet, RouterModule, YouTubePlayer],
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})
export class SalaComponent implements OnInit {
  videoId: string | undefined;
  videoUrl!: SafeResourceUrl;
  messages: string[] = [];
  newMessage: string = '';
  subscriptions: Subscription[] = [];
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer,private socketService: SocketService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.videoId = params['videoId'];
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
    });
    this.subscriptions.push(
      this.socketService.onEvent(socketEvents.PAUSE).subscribe(() => {
        this.pauseVideo(); // Pausar el video
      }),
      this.socketService.onEvent(socketEvents.PLAY).subscribe(() => {
        this.playVideo(); // Reproducir el video
      }),
      this.socketService.onEvent(socketEvents.DECREASE_SPEED).subscribe(() => {
        this.decreaseSpeed(); // Disminuir la velocidad de reproducción
      }),
      this.socketService.onEvent(socketEvents.NOTHING).subscribe(() => {
        this.normalSpeed(); // Restablecer velocidad
      })
    );
  }

  // Métodos para controlar el reproductor de YouTube
  pauseVideo() {
    const player = this.getYouTubePlayer();
    if (player) {
      player.pauseVideo();
    }
  }

  playVideo() {
    const player = this.getYouTubePlayer();
    if (player) {
      player.playVideo();
    }
  }

  decreaseSpeed() {
    const player = this.getYouTubePlayer();
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(0.5); // Disminuir la velocidad de reproducción
    }
  }

  normalSpeed() {
    const player = this.getYouTubePlayer();
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(1); // Restablecer a velocidad normal
    }
  }

  // Método para obtener el reproductor de YouTube
  getYouTubePlayer() {
    return document.querySelector('youtube-player'); // Obtiene el elemento del DOM
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.messages.push(this.newMessage);
      this.newMessage = '';
    }
  }

  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      this.sendMessage();
    }
  }
}
