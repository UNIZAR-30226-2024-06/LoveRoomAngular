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
  segundos: number = 0;
  messages: string[] = [];
  newMessage: string = '';
  subscriptions: Subscription[] = [];
  player: any;
  sala: string = '';

  //Variables traidas del componente youtube
  showResults = false;
  searchQuery: string = '';
  videos: any[] = [];
  errorMessage: string = '';

  enPausa: boolean = false;

  //private socketService: SocketService = inject(SocketService);

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router, private socketService: SocketService, private http: HttpClient) { } 

  ngOnInit(): void {
    this.socketService.connect();
    
    const videoIdAux = localStorage.getItem('videoId');
    this.videoId = String(videoIdAux);
    this.route.params.subscribe(params => {
      this.sala = params['id'];
      console.log('Sala ID actualizado:', this.sala);
    });
    this.joinRoom();
    
    
    if (/^\d+$/.test(this.sala)) {
      this.socketService.emitGetSync(socketEvents.GET_SYNC, this.sala);
    }

    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
     
     this.subscriptions.push(
      this.socketService.listenPausePlay(socketEvents.PAUSE).subscribe(() => {
        this.youtubePlayer.pauseVideo(); // Pausar el video
      }),
      this.socketService.listenPausePlay(socketEvents.PLAY).subscribe(() => {
        this.youtubePlayer.playVideo(); // Reproducir el video
      }),
      this.socketService.listenChangeVideo(socketEvents.CHANGE_VIDEO).subscribe(idVideo => {
        this.videoId = idVideo;
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
        this.youtubePlayer.playVideo();
      }),
      this.socketService.listenGetSync(socketEvents.GET_SYNC).subscribe(() => {
        this.socketService.emitSyncOn(socketEvents.SYNC_ON, this.sala, this.videoId, this.youtubePlayer.getCurrentTime(), this.enPausa, true);
      }),
      this.socketService.ListenSyncEvent(socketEvents.SYNC_ON).subscribe(({idVideo, timesegundos, pausado}) => {
        this.videoId = idVideo;
        //this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
        if(this.youtubePlayer){
        this.youtubePlayer.pauseVideo();
        alert(timesegundos);
        this.segundos = timesegundos;
        this.youtubePlayer.seekTo(this.segundos, false);
        if(pausado){
          this.youtubePlayer.pauseVideo();
        }else{
          this.youtubePlayer.playVideo();
        }
        this.updateVideoPlayer(this.videoId);
      }
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
      this.enPausa = false;
    } else if (event.data === YT.PlayerState.PAUSED) {
      console.log('PAUSE event received and video paused');
      this.pauseVideo();
      this.enPausa = true;
    }
  }

  // Emite un evento PAUSE al servidor para informar que el usuario ha pausado el video
  pauseVideo(): void {
    this.enPausa = true;
    this.socketService.emitPlayPause(socketEvents.PAUSE, this.sala);
    console.log('Evento PAUSE emitido');
    this.mandarTiempo(this.youtubePlayer.getCurrentTime());
  }

  // Emite un evento PAUSE al servidor para informar que el usuario ha pausado el video
  playVideo(): void {
    this.enPausa = false;
    this.socketService.emitPlayPause(socketEvents.PLAY, this.sala);
    console.log('Evento PLAY emitido');
  }

  mandarTiempo(segundos: number){
    this.socketService.emitTiempo(socketEvents.STORE_TIME, this.sala, segundos);
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

  changeVideo(videoId2: string){
    // Actualiza localmente el videoId y la URL del video
    this.videoId = videoId2;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId2);
    
     // Informa a Angular de que debe revisar y actualizar el enlace de datos
    this.updateVideoPlayer(videoId2);

    this.socketService.emitChangeVideo(socketEvents.CHANGE_VIDEO, this.sala, videoId2);
    localStorage.setItem('videoId', videoId2);
  }

  updateVideoPlayer(videoId: string) {
    if (this.youtubePlayer) {
        // Forzar la actualización del componente YouTubePlayer
        this.youtubePlayer.videoId = videoId; // Actualiza el videoId directamente
        this.youtubePlayer.ngOnChanges({}); // Forzar a Angular a detectar los cambios
        localStorage.setItem('videoId', videoId);
    }
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

    
  ngOnDestroy(): void {
    // Cancela todas las suscripciones cuando el componente se destruye para prevenir fugas de memoria
    // Asegurarse de desconectar el socket al salir
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.socketService.disconnect();
    localStorage.removeItem('videoId');
    console.log('Socket desconectado al salir de la sala');
  }
}
