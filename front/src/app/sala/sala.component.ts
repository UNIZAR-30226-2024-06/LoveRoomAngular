import { Component, ViewChild, ElementRef, OnDestroy, OnInit, inject,AfterViewInit, AfterRenderOptions, AfterViewChecked } from '@angular/core';
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
export class SalaComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild(YouTubePlayer, { static: false }) youtubePlayer!: YouTubePlayer;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInputImage') fileInputImage!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputVideo') fileInputVideo!: ElementRef<HTMLInputElement>;


  playerVars = {
    autoplay: 1,  // 0 o 1 (1 significa autoplay activado)
    controls: 1,  // 0 o 1 (1 muestra los controles del reproductor)
    modestbranding: 1, // 1 para minimizar la marca de YouTube en el reproductor
    enablejsapi: 1,  // 1 permite la interacción con el API de JavaScript
    fs: 1,  // 0 o 1 (1 permite el botón de pantalla completa)
    iv_load_policy: 3, // 1 o 3 (3 para no mostrar anotaciones en el video)
    rel: 0,  // 0 para no mostrar videos relacionados al final
    showinfo: 0, // 0 para no mostrar información del video
  };
  
  roomId: string = '';
  videoUrl!: SafeResourceUrl;
  videoId: string = '';
  segundos: number = 0;
  messages: { id: number, text: string, multimedia: string | null, timestamp: number, isOwnMessage: boolean, showReportBox?: boolean, reportText?: string, imgCargada:any}[] = [];
  newMessage: string = '';
  idMsg: number = 0;
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
  multimediaUrl: string | null = null;
  flag_imagen = false;
  flag_video = false;
  file: any;
  
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
      this.socketService.listenReceiveMessage(socketEvents.RECEIVE_MESSAGE).subscribe(async ({idMsg, texto, rutaMultimedia}) => {
        let newMsg = {
          id: idMsg,
          text: texto,
          multimedia: rutaMultimedia,
          timestamp: Date.now(),
          isOwnMessage: false, // Asumimos que sendMessage siempre es llamado por el usuario actual
          imgCargada: 'assets/Logo.png'
        };
        
        if(newMsg.multimedia !== null){
          const image = await fetch('http://'+environment.host_back+'/multimedia/' + newMsg.multimedia);
          const blob = await image.blob();
          const objectURL = URL.createObjectURL(blob);
          newMsg.imgCargada = objectURL;
        }
        this.messages.push(newMsg);
        this.scrollToBottom();
      }), 
      this.socketService.listenUnmatch(socketEvents.UNMATCH).subscribe((idSala) => {
        this.listenUnmatch();
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
                this.obtenerPerfillUsuario();
                  //AÑADIR AQUI
                  this.http.get<any>(`http://${environment.host_back}/${this.sala}/chat`, { headers })
                  .subscribe(
                    response => {
                      response.forEach(async (msg: any) => {
                        const isOwnMessage = msg.idusuario === this.idUsuario;
                        const newMsg = {
                          id: msg.id,
                          text: msg.texto,
                          multimedia: msg.rutamultimedia,
                          timestamp: new Date(msg.fechahora).getTime(),
                          isOwnMessage: isOwnMessage,
                          imgCargada: 'assets/Logo.png'
                        };
                        if (newMsg.multimedia !== null) {
                          const response = await fetch('http://' + environment.host_back + '/multimedia/' + newMsg.multimedia, {
                            headers: {
                              'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                          });
                          const blob = await response.blob();
                        
                          // Ver todas las cabeceras de la respuesta
                          response.headers.forEach((value, key) => {
                            console.log(`${key}: ${value}`);
                          });
                        
                          const tipoArchivo = response.headers.get('Tipo-Multimedia');
                          //alert(tipoArchivo);
                        
                          const objectURL = URL.createObjectURL(blob);
                          newMsg.imgCargada = objectURL;
                        }
                        this.messages.push(newMsg);
                        this.scrollToBottom();
                      });
                    },
                    error => {
                      if (error.status === 403) {
                        console.error('Error: El usuario no pertenece a la sala indicada');
                      } else {
                        console.error('Error al obtener mensajes de sala', error);
                      }
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

async obtenerPerfillUsuario(): Promise<void> {
  const headers = new HttpHeaders({
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  });
  const response = await this.http.get<any>('http://'+environment.host_back+'/user/'+this.idUsuarioMatch, { headers: headers }).toPromise();
  try {
    console.log(response);
    this.usuarioMatch = response;
    const image = await fetch('http://'+environment.host_back+'/multimedia/' + this.usuarioMatch.fotoperfil);
    const blob = await image.blob();
    const objectURL = URL.createObjectURL(blob);
    this.imagenPerfil = this.usuarioMatch.fotoperfil === 'null.jpg' ? this.imagenPerfil : objectURL;
  }
  catch (error: any) {
    console.error('Error al obtener el perfil del usuario', error);
    this.error = 'Error al obtener el perfil del usuario';
  }
}

ngAfterViewInit(): void {
  this.scrollToBottom();
}

ngAfterViewChecked(): void {
  this.scrollToBottom();
}


scrollToBottom(): void {
  try {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  } catch(err) {
    console.error('Error al desplazar el contenedor de mensajes', err);
  }
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
    this.socketService.listenPausePlay(socketEvents.PAUSE).subscribe(() => {
      this.youtubePlayer.pauseVideo();
      this.enPausa=true;
    }
  ),
    this.socketService.listenPausePlay(socketEvents.PLAY).subscribe(() => {
      this.youtubePlayer.playVideo();
      this.enPausa=false;
    }
  ),
    this.socketService.listenChangeVideo(socketEvents.CHANGE_VIDEO).subscribe(idVideo => this.changeVideo(idVideo))
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
      if (this.enPausa){
        this.playVideo(); // Reproduce el video y emite un evento PLAY
        this.enPausa = false;
      }
    } else if (event.data === YT.PlayerState.PAUSED) {
      console.log('PAUSE event received and video paused');
      if (this.enPausa==false){
        this.pauseVideo(); // Pausa el video y emite un evento PAUSE
        this.enPausa = true;
      }
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

  

  async sendMessage(): Promise<void> {
    if (this.newMessage.trim() !== '' || this.multimediaUrl) {
      const newMsg = {
        id: this.idMsg,
        text: this.newMessage,
        multimedia: this.multimediaUrl,
        timestamp: Date.now(),
        isOwnMessage: true,// Asumimos que sendMessage siempre es llamado por el usuario actual
        imgCargada: this.multimediaUrl
      };
      
      this.messages.push(newMsg);
      this.clearMultimedia();
      
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      });

      if (this.flag_imagen == true) {
        const formData = new FormData();
        formData.append('file',this.file);
        try {
          const response = await this.http.post<any>('http://'+environment.host_back+'/multimedia/upload/foto/'+this.idUsuario, formData, { headers: headers }).toPromise();
          console.log('Imagen subida', response);
          this.multimediaUrl = response.nombreArchivo;
        }
        catch (error: any) {
          console.error('Error al subir la imagen', error.message);
          this.error = error.error.error;
          alert(error.message); 
        }
      }
      else if (this.flag_video == true) {
        const formData = new FormData();
        formData.append('file',this.file);
        try {
          const response = await this.http.post<any>('http://'+environment.host_back+'/multimedia/upload/video/'+this.idUsuario, formData, { headers: headers }).toPromise();
          console.log('Video subido', response);
          this.multimediaUrl = response.nombreArchivo;
        }
        catch (error: any) {
          console.error('Error al subir el video', error.message);
          this.error = error.error.error;
          alert(error.message); 
        }
      }
      this.socketService.emitCreateMessage(socketEvents.CREATE_MESSAGE, this.sala, this.newMessage, this.multimediaUrl);
      this.newMessage = '';
      this.scrollToBottom();
      this.flag_imagen = false;
      this.flag_video = false;
    }
  }

  triggerFileInput(type: string): void {
    if (type === 'image' && this.fileInputImage && this.fileInputImage.nativeElement) {
      this.fileInputImage.nativeElement.click();
    } else if (type === 'video' && this.fileInputVideo && this.fileInputVideo.nativeElement) {
      this.fileInputVideo.nativeElement.click();
    }
  }
  

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png'];
      const fileExtension = fileName.split('.').pop();
  
      if (fileExtension && validExtensions.includes(fileExtension)) {
        this.file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.multimediaUrl = reader.result as string; // Almacena la URL del archivo multimedia
        };
        reader.readAsDataURL(file);
        this.flag_imagen = true;
      } else {
        alert('Solo se permiten archivos de tipo JPG o PNG.');
        this.clearMultimedia();
      }
    }
  }

  handleVideoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();
      const validExtensions = ['mp4', 'amv'];
      const fileExtension = fileName.split('.').pop();
  
      if (fileExtension && validExtensions.includes(fileExtension)) {
        this.file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.multimediaUrl = reader.result as string; // Almacena la URL del archivo multimedia
        };
        reader.readAsDataURL(file);
        this.flag_video = true;
      } else {
        alert('Solo se permiten archivos de tipo mp4 o amv.');
        this.clearMultimedia();
      }
    }
  }
  

  clearMultimedia(): void {
    this.multimediaUrl = null;
    if (this.fileInputImage && this.fileInputImage.nativeElement) {
      this.fileInputImage.nativeElement.value = '';
    }
    if (this.fileInputVideo && this.fileInputVideo.nativeElement) {
      this.fileInputVideo.nativeElement.value = '';
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

  listenUnmatch(): void {
    this.router.navigate(['/mis-salas']);
    alert("El otro usuario ha borrado la sala, volviendo a mis salas");
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

  toggleReportBox(messageId: number): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.showReportBox = !message.showReportBox;
    }
  }

  reportMessage(idMsg: number, motivo: string): void {
    const token = localStorage.getItem('token'); // Obtén el token del almacenamiento local
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const body = { motivo }; // Cuerpo de la petición con el motivo del reporte
  
    this.http.post(`http://${environment.host_back}/reports/${idMsg}`, body, { headers })
      .subscribe(
        response => {
          console.log('Reporte creado exitosamente:', response);
          alert('Reporte enviado exitosamente');
          // Puedes añadir cualquier otra lógica que desees ejecutar después de crear el reporte
        },
        error => {
          console.error('Error al crear el reporte:', error);
          alert('Error al enviar el reporte');
        }
      );
  }
}