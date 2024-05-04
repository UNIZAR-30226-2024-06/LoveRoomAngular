import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabeceraYMenuComponent } from '../cabecera-y-menu/cabecera-y-menu.component';
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
  imports: [CabeceraYMenuComponent, CommonModule, FormsModule, RouterOutlet, RouterModule, YouTubePlayer],
  providers: [SocketService],
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})
export class SalaComponent implements OnInit  {
  @ViewChild(YouTubePlayer) youtubePlayer!: YouTubePlayer;
  private subscriptions = new Subscription(); // Define la propiedad para manejar las suscripciones
  videoId: string | undefined;
  videoUrl!: SafeResourceUrl;
  messages: string[] = [];
  newMessage: string = '';
  videoPlaying: boolean = true;
  isEnabled: boolean = false;
  selectedVideoUrl: string = '';
  
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private SocketService: SocketService) { } 

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.videoId = params['videoId'];
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
      this.setupPlayerEvents();
    });
  // Escuchar eventos del socket
  this.SocketService.listenToEvents();  // Asegúrate de llamar a esto en algún lugar adecuado

  // Suscribirse a cambios de estado emitidos por el socket
  const socketSub = this.SocketService.getSocketState().subscribe(state => {
    if (state.play) {
      this.playVideo();
    } else {
      this.pauseVideo();
    }
  });

  this.subscriptions.add(socketSub);
}

private playVideo() {
  if (this.youtubePlayer) {
    this.youtubePlayer.playVideo();  // Método de API de YouTube para reproducir el video
  }
}

private pauseVideo() {
  if (this.youtubePlayer) {
    this.youtubePlayer.pauseVideo();  // Método de API de YouTube para pausar el video
  }
}

ngOnDestroy(): void {
  // Llamar a leaveRoom antes de desconectar el socket
  if (this.videoId) { // Asegurarse de que el videoId está disponible
    this.SocketService.leaveRoom(this.videoId); // Usar el id de la sala
  }
  // Limpiar los oyentes de eventos del socket y desconectar
  this.SocketService.cleanUpListeners();
  this.SocketService.disconnectSocket();
  // Desuscribirse de todas las suscripciones
  this.subscriptions.unsubscribe();
}


  private setupPlayerEvents() {
    if (!this.youtubePlayer) {
      console.error('YouTube Player not initialized');
      return;
    }

    this.youtubePlayer.stateChange.subscribe(event => {
      if (event.data === YT.PlayerState.PLAYING && !event.target.getPlayerState()) {
        console.log('Video is playing');
        this.SocketService.send({ type: 'PLAY', idSala: 'yourRoomId' });
      } else if (event.data === YT.PlayerState.PAUSED) {
        console.log('Video is paused');
        this.SocketService.send({ type: 'PAUSE', idSala: 'yourRoomId' });
      }
    });
  }

  //No borrar
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
