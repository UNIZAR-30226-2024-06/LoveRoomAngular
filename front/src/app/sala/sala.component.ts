import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
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
  imports: [CabeceraYMenuComponent, CommonModule, FormsModule, RouterOutlet, RouterModule],
  providers: [SocketService],
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css']
})
export class SalaComponent implements OnInit, OnDestroy {
  @ViewChild(YouTubePlayer) youtubePlayer!: YouTubePlayer;
  roomId: string | undefined;
  videoId: string | undefined;
  videoUrl!: SafeResourceUrl;
  messages: string[] = [];
  newMessage: string = '';
  subscriptions: Subscription[] = [];
  player: any;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private socketService: SocketService) { } 

  ngOnInit(): void {
    // Se suscribe a los cambios en los parámetros de la ruta para obtener el videoId del video a reproducir
    this.route.params.subscribe(params => {
      this.videoId = params['videoId'];
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
    });
    
     // Configura los listeners de sockets para los eventos de control de video
    this.setupSocketListeners();
  }

  setupSocketListeners(): void {
    // Suscribirse al evento PAUSE para pausar el video cuando se recibe el evento desde otro usuario
    const pauseSub = this.socketService.onEvent(socketEvents.PAUSE).subscribe(() => {
      this.youtubePlayer.pauseVideo(); // Pause el video
      alert('PAUSE event received and video paused');
    });
    // Suscribirse al evento PLAY para reproducir el video cuando se recibe el evento desde otro usuario
    const playSub = this.socketService.onEvent(socketEvents.PLAY).subscribe(() => {
      this.youtubePlayer.playVideo(); // Play el video
      alert('PLAY event received and video played');
    });

    // Almacena las suscripciones para poder cancelarlas más tarde, evitando fugas de memoria
    this.subscriptions.push(pauseSub, playSub);
  }
  
  ngOnDestroy(): void {
    // Cancela todas las suscripciones cuando el componente se destruye para prevenir fugas de memoria
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
