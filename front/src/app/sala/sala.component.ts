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
import { YouTubePlayer } from '@angular/youtube-player';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CabeceraYMenuComponent, CommonModule, FormsModule, RouterOutlet, RouterModule],
  //providers: [SocketService], Comentado para asegurar el patron singleton
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})
export class SalaComponent implements OnInit {
  @ViewChild(YouTubePlayer) youtubePlayer!: YouTubePlayer;
  roomId: string = '';
  videoUrl!: SafeResourceUrl;
  videoId: string | undefined;
  messages: string[] = [];
  newMessage: string = '';
  subscriptions: Subscription[] = [];
  player: any;
  sala: any;
  //private socketService: SocketService = inject(SocketService);

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router, private socketService: SocketService) { } 

  ngOnInit(): void {
    
    const videoIdAux = localStorage.getItem('videoId');
    this.sala = localStorage.getItem('Sala');
    localStorage.removeItem('Sala');

    if (videoIdAux) {
      this.videoId = videoIdAux;
      localStorage.removeItem('videoId');
    }
    else{
      this.route.params
        .pipe(first())
        .subscribe(params => {
          const videoIdAux = params['id'];
          if (videoIdAux) {
            this.videoId = videoIdAux;
          }
        });
    }
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
     // Configura los listeners de sockets para los eventos de control de video
     
    
  }

  ngAfterViewInit(): void {
    this.setupYouTubePlayerEvents();
  }

  setupYouTubePlayerEvents(): void {
    alert('Configurando eventos de YouTubePlayer');
    if (!this.youtubePlayer) {
      console.error('YouTubePlayer no está inicializado');
      return;
    }

    // Escuchar el evento de cambio de estado
    alert('Evento de cambio de estado escuchado');
    this.youtubePlayer.stateChange.subscribe((event) => {
      // Verificar si el estado cambió a "playing" o "paused"
      alert('Configurando eventos a escuchar')
      if (event.data === 1) {
        // 1 significa que el video está reproduciéndose
        alert('PLAY event received and video played');
        //this.socketService.playVideo(this.roomId);
      } else if (event.data === 2) {
        // 2 significa que el video está pausado
        alert('PAUSE event received and video paused');
        //this.socketService.pauseVideo(this.roomId);
      }
    });
    
  }
  

  /*setupSocketListeners(): void {
    // Suscribirse al evento PAUSE para pausar el video cuando se recibe el evento desde otro usuario
    const pauseSub = this.socketService.listen(socketEvents.PAUSE).subscribe(() => {
      this.youtubePlayer.pauseVideo(); // Pause el video
      alert('PAUSE event received and video paused');
    });
    // Suscribirse al evento PLAY para reproducir el video cuando se recibe el evento desde otro usuario
    const playSub = this.socketService.listen(socketEvents.PLAY).subscribe(() => {
      this.youtubePlayer.playVideo(); // Play el video
      alert('PLAY event received and video played');
    });

    // Almacena las suscripciones para poder cancelarlas más tarde, evitando fugas de memoria
    this.subscriptions.push(pauseSub, playSub);
  }*/
  
  ngOnDestroy(): void {
    // Cancela todas las suscripciones cuando el componente se destruye para prevenir fugas de memoria
    // Asegurarse de desconectar el socket al salir
    this.socketService.disconnect();
    alert('Socket desconectado al salir de la sala');
  }

  // Emite un evento PAUSE al servidor para informar que el usuario ha pausado el video
  pauseVideo(): void {
    this.socketService.emitEvent(socketEvents.PAUSE, { roomId: this.roomId });
    alert('Evento PAUSE emitido');
  }

  // Emite un evento PAUSE al servidor para informar que el usuario ha pausado el video
  playVideo(): void {
    this.socketService.emitEvent(socketEvents.PLAY, { roomId: this.roomId });
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
