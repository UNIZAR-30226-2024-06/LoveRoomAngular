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
import { OrderByPipe } from '../../services/pipe';
import { Subscription, first } from 'rxjs';
import { YouTubePlayer, YouTubePlayerModule } from '@angular/youtube-player';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CabeceraYMenuComponent, CommonModule, FormsModule, RouterOutlet, RouterModule, YouTubePlayerModule, OrderByPipe],
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
  messages: { text: string, multimedia: string, timestamp: number, isOwnMessage: boolean }[] = [];
  newMessage: string = '';
  subscriptions1: Subscription[] = [];
  player: any;
  sala: string = '';

  //Variables traidas del componente youtube
  showResults = false;
  searchQuery: string = '';
  videos: any[] = [];
  errorMessage: string = '';

  enPausa: boolean = false;
  playerReady: boolean = false;
  msgId: any;
  timeStamp: number = 0;

  intervalo: any; 
  tiempoPrevio: number = 0;
  flagAvance: boolean = false;

  currentImage: string = 'assets/OFF.jpg';  // Inicia con la primera imagen
  isFirstImage: boolean = true;  // Controlar qué imagen mostrar
  
  //Datos de la otra persona
  usuarioMatch: any;
  idUsuarioMatch: number = 0;
  idUsuario: number = 0;
  imagenPerfil = 'assets/Logo.png';
  provinciasDeEspana: string[] = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares', 'Barcelona', 'Burgos',
    'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Gerona',
    'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas',
    'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Orense', 'Palencia',
    'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel',
    'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
  ];
  error: string = '';

  // Estados de sincronización
  isSynchronized: boolean = false;  // Estado global de sincronización

  // Variables para controlar la lógica de negocio
  syncSubscription!: Subscription;
  videoControlSubscriptions: Subscription[] = [];
  lastPlayedSeconds: any;
  
  //private socketService: SocketService = inject(SocketService);

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router, private socketService: SocketService, private http: HttpClient) { } 

  async ngOnInit(): Promise<void> {
    this.socketService.connect();
    
    const videoIdAux = localStorage.getItem('videoId');
    this.videoId = String(videoIdAux);
    this.route.params.subscribe(params => {
      this.sala = params['id'];
      console.log('Sala ID actualizado:', this.sala);
    });
    this.joinRoom();
  
    this.socketService.emitGetSync(socketEvents.GET_SYNC, this.sala);

    this.manageSyncEvents();
    
     this.subscriptions1.push(
      this.socketService.listenGetSync(socketEvents.GET_SYNC).subscribe(() => {
        //this.youtubePlayer.pauseVideo(); // Pausar el video
        
        //this.socketService.emitSyncOn(socketEvents.SYNC_ON, this.sala, this.videoId, this.youtubePlayer.getCurrentTime(), this.enPausa);
      }),
      this.socketService.listenReceiveMessage(socketEvents.RECEIVE_MESSAGE).subscribe(({texto, rutaMultimedia}) => {
        const newMsg = {
          text: texto,
          multimedia: rutaMultimedia,
          timestamp: Date.now(),
          isOwnMessage: false // Asumimos que sendMessage siempre es llamado por el usuario actual
        };
        this.messages.push(newMsg);
      })
    );

    //this.desincronizar();
    //this.sincronizar();
    
    //Obtener datos de la otra persona
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });

    this.http.get<any>('http://'+environment.host_back+'/user/profile', { headers: headers })
      .subscribe(
        response => {
          this.idUsuario = response.id;
          this.http.get<any>('http://'+environment.host_back+'/rooms/'+this.sala+'/members', { headers: headers })
            .subscribe(
              response => {
                if(this.idUsuario == response[0].idusuario){
                  this.idUsuarioMatch = response[1].idusuario;
                }
                else{
                  this.idUsuarioMatch = response[0].idusuario;
                  this.idUsuario = response[1].idusuario;
                }
                console.log(response);
                this.http.get<any>('http://'+environment.host_back+'/user/'+this.idUsuarioMatch, { headers: headers })
                  .subscribe(
                    response => {
                      console.log(response);
                      this.usuarioMatch = response;
                      this.imagenPerfil = this.usuarioMatch.fotoperfil === 'null.jpg' ? this.imagenPerfil : this.usuarioMatch.fotoperfil;
                    },
                    error => {
                      console.error('Error al obtener el perfil del usuario', error);
                      this.error = 'Error al obtener el perfil del usuario';
                    }
                  );
              },
              error => {
                console.error('Error al obtener los miembros de la sala', error);
                this.error = 'Error al obtener los miembros de la sala';
              }
            );
        },
        error => {
          console.error('Error al obtener el perfil del usuario', error);
          this.error = 'Error al obtener el perfil del usuario';
        }
      );
}

async delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Manejar eventos de sincronización
manageSyncEvents(): void {
  // Escucha para iniciar la sincronización
  this.syncSubscription = this.socketService.ListenSyncEvent(socketEvents.SYNC_ON)
    .subscribe(({ idVideo, timesegundos, pausado }) => {
      this.applyVideoSettings(idVideo, timesegundos, pausado);
      this.setupVideoControlListeners();
      this.isSynchronized = true;
      this.currentImage = 'assets/ON.jpg';
    });

  // Escuchar para desincronizar
  this.socketService.ListenSyncOff(socketEvents.SYNC_OFF).subscribe(() => {
    this.clearVideoControlListeners();
    this.isSynchronized = false;
    this.currentImage = 'assets/OFF.jpg';
  });
}

// Establecer oyentes para controles de video
setupVideoControlListeners(): void {
  this.clearVideoControlListeners(); // Limpiar suscripciones previas
  this.videoControlSubscriptions = [
    this.socketService.listenPausePlay(socketEvents.PAUSE).subscribe(() => this.youtubePlayer.pauseVideo()),
    this.socketService.listenPausePlay(socketEvents.PLAY).subscribe(() => this.youtubePlayer.playVideo()),
    this.socketService.listenChangeVideo(socketEvents.CHANGE_VIDEO).subscribe(idVideo => this.changeVideo(idVideo)),
    this.socketService.listenUnmatch(socketEvents.UNMATCH).subscribe(() => this.listenUnmatch())
  ];
}

// Limpiar oyentes de control de video
clearVideoControlListeners(): void {
  this.videoControlSubscriptions.forEach(sub => sub.unsubscribe());
  this.videoControlSubscriptions = [];
}

  onPlayerReady(): void {
    this.youtubePlayer.playVideo();
    this.playerReady = true;  // Actualiza el estado cuando el reproductor esté listo
    console.log('Player ready event received');
  }

  applyVideoSettings(idVideo: string, timesegundos: number, pausado: boolean): void {
    this.videoId = idVideo;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + idVideo);
    this.updateVideoPlayer(this.videoId);
    this.youtubePlayer.seekTo(timesegundos, true);

    if (pausado) {
      this.youtubePlayer.pauseVideo();
    } else {
      this.youtubePlayer.playVideo();
    }
  }

  joinRoom(): void {
    this.socketService.emitJoinLeave(socketEvents.JOIN_ROOM, this.sala); // Asegúrate de implementar esta funcionalidad en el servidor
  }


  onStateChange(event: any): void {
    console.log('YouTube Player state changed', event.data);
    if (event.data === YT.PlayerState.PLAYING) {
      console.log('PLAY event received and video played');
      if (this.lastPlayedSeconds) {
        const currentSeconds = this.youtubePlayer.getCurrentTime();
        const diff = currentSeconds - this.lastPlayedSeconds;
        if ((Math.abs(diff) >= 1) && this.isSynchronized){
          this.socketService.emitSyncOn(socketEvents.SYNC_ON, this.sala, this.videoId, currentSeconds, this.enPausa);
        }
      }
      this.lastPlayedSeconds = this.youtubePlayer.getCurrentTime();
      this.playVideo(); // Si se está reproduciendo, continua la reproducción
      this.enPausa = false;
    } else if (event.data === YT.PlayerState.PAUSED) {
      console.log('PAUSE event received and video paused');
      this.pauseVideo(); // Pausa el video y emite un evento PAUSE
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
    const rutaMultimedia = '';
    if (this.newMessage.trim() !== '') {
      const newMsg = {
        text: this.newMessage,
        multimedia: rutaMultimedia,
        timestamp: Date.now(),
        isOwnMessage: true // Asumimos que sendMessage siempre es llamado por el usuario actual
      };
      this.messages.push(newMsg);
      this.socketService.emitCreateMessage(socketEvents.CREATE_MESSAGE, this.sala, this.newMessage, rutaMultimedia);
      this.newMessage = '';
    }
  }


  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      this.sendMessage();
    }
  }

  getSexoDesc(sexo: string): string {
    if (sexo === 'H') {
        return 'Hombre';
    } else if (sexo === 'M') {
        return 'Mujer';
    } else if (sexo === 'O') {
        return 'Otro';
    } else {
        return 'No especificado'; // Por si acaso hay algún valor inesperado
    }
  }

  getLocalidadDesc(id: number): string {
    if (id >= 1 && id <= this.provinciasDeEspana.length) {
      return this.provinciasDeEspana[id - 1];
    } else {
      return 'Desconocido';
    }
  }

  sincronizar(): void {
    if (!this.isSynchronized) {
      this.socketService.emitSyncOn(socketEvents.SYNC_ON, this.sala, this.videoId, this.youtubePlayer.getCurrentTime(), this.enPausa);
      this.setupVideoControlListeners();
    }
  }

  desincronizar(): void {
    if (this.isSynchronized) {
      this.socketService.emitSyncOff(socketEvents.SYNC_OFF, this.sala);
      this.clearVideoControlListeners();
    }
  }

  // Método para cambiar la imagen y ejecutar funciones
  toggleImage(): void {
    if (this.isSynchronized) {
      this.currentImage = 'assets/OFF.jpg';
      this.desincronizar();  // Ejecutar la primera función
    } else {
      this.currentImage = 'assets/ON.jpg';
      this.sincronizar();  // Ejecutar la segunda función
    }
    this.isSynchronized = !this.isSynchronized;  // Cambiar el estado de la imagen
  }

  emitUnmatch(): void {
    const iduser = this.idUsuario.toString();
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    });
    this.socketService.emitUnmatch(socketEvents.UNMATCH, iduser, this.sala);
    this.http.delete<any>('http://'+environment.host_back+'/rooms/'+this.sala, { headers: headers })
      .subscribe(
        response => {
          alert("Sala borrada con éxito, volviendo a mis salas");
          this.router.navigate(['/mis-salas']);
        },
        error => {
          alert('Error al borrar sala');
        }
      );
  }

  listenUnmatch(): void {
    alert("El otro usuario ha borrado la sala, volviendo a mis salas");
    this.router.navigate(['/mis-salas']);
  }
    
  ngOnDestroy(): void {
    // Cancela todas las suscripciones cuando el componente se destruye para prevenir fugas de memoria
    // Asegurarse de desconectar el socket al salirthis.syncSubscription.unsubscribe();
    this.clearVideoControlListeners();
    this.subscriptions1.forEach(sub => sub.unsubscribe());
    this.socketService.emitJoinLeave(socketEvents.LEAVE_ROOM, this.sala);
    this.socketService.disconnect();
    localStorage.removeItem('videoId');
    console.log('Socket desconectado al salir de la sala');
  }
}
