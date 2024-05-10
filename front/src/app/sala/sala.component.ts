import { Component, ViewChild, OnDestroy, OnInit, inject,AfterViewInit } from '@angular/core';
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
import { Subscription, first } from 'rxjs';
import { YouTubePlayer, YouTubePlayerModule } from '@angular/youtube-player';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CabeceraYMenuComponent, CommonModule, FormsModule, RouterOutlet, RouterModule, YouTubePlayerModule],
  //providers: [SocketService], Comentado para asegurar el patron singleton
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})
export class SalaComponent implements OnInit {
  @ViewChild(YouTubePlayer, { static: false }) youtubePlayer!: YouTubePlayer;
  playerVars = {
    autoplay: 1,  // 0 o 1 (1 significa autoplay activado)
    controls: 1,  // 0 o 1 (1 muestra los controles del reproductor)
    modestbranding: 1, // 1 para minimizar la marca de YouTube en el reproductor
    enablejsapi: 1,  // 1 permite la interacción con el API de JavaScript
    fs: 1,  // 0 o 1 (1 permite el botón de pantalla completa)
    iv_load_policy: 3, // 1 o 3 (3 para no mostrar anotaciones en el video)
  };
  roomId: string = '';
  videoUrl!: SafeResourceUrl;
  videoId: string = '';
  messages: string[] = [];
  newMessage: string = '';
  subscriptions: Subscription[] = [];
  player: any;
  sala: string = '';

  //private socketService: SocketService = inject(SocketService);

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router, private socketService: SocketService) { } 

  ngOnInit(): void {
    this.socketService.connect();
    
    const videoIdAux = localStorage.getItem('videoId');
    this.videoId = String(videoIdAux);
    this.route.params.subscribe(params => {
      this.sala = params['id'];
      console.log('Sala ID actualizado:', this.sala);
    });
    this.joinRoom();

    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
     
     this.subscriptions.push(
      this.socketService.listenPausePlay(socketEvents.PAUSE).subscribe(() => {
        this.youtubePlayer.pauseVideo(); // Pausar el video
      }),
      this.socketService.listenPausePlay(socketEvents.PLAY).subscribe(() => {
        this.youtubePlayer.playVideo(); // Reproducir el video
      })
    );
  }

  joinRoom(): void {
    this.socketService.emitJoinLeave(socketEvents.JOIN_ROOM, this.sala); // Asegúrate de implementar esta funcionalidad en el servidor
  }

  onPlayerReady(event: any): void {
    console.log('YouTube Player is ready', event);
    // Aquí puedes también inicializar configuraciones adicionales del reproductor si es necesario.
  }

  onStateChange(event: any): void {
    console.log('YouTube Player state changed', event.data);
    if (event.data === YT.PlayerState.PLAYING) {
      console.log('PLAY event received and video played');
      this.playVideo();
    } else if (event.data === YT.PlayerState.PAUSED) {
      console.log('PAUSE event received and video paused');
      this.pauseVideo();
    }
  }
  
  ngOnDestroy(): void {
    // Cancela todas las suscripciones cuando el componente se destruye para prevenir fugas de memoria
    // Asegurarse de desconectar el socket al salir
    this.socketService.disconnect();
    localStorage.removeItem('videoId');
    console.log('Socket desconectado al salir de la sala');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Emite un evento PAUSE al servidor para informar que el usuario ha pausado el video
  pauseVideo(): void {
    console.log('Evento PAUSE emitido');
    this.socketService.emitPlayPause(socketEvents.PAUSE, this.sala);
    console.log('Evento PAUSE emitido');
  }

  // Emite un evento PAUSE al servidor para informar que el usuario ha pausado el video
  playVideo(): void {
    console.log('Evento PLAY emitido');
    this.socketService.emitPlayPause(socketEvents.PLAY, this.sala);
    console.log('Evento PLAY emitido');
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
