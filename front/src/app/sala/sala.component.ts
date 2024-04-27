import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
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
export class SalaComponent implements OnInit {
  @ViewChild(YouTubePlayer) youtubePlayer!: YouTubePlayer;
  videoId: string | undefined;
  videoUrl!: SafeResourceUrl;
  messages: string[] = [];
  newMessage: string = '';
  subscriptions: Subscription[] = [];
  player: any;
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private socketService: SocketService) { } 

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.videoId = params['videoId'];
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.videoId);
    });
    this.subscriptions.push(
      this.socketService.onEvent(socketEvents.PAUSE).subscribe(() => {
        this.youtubePlayer.pauseVideo(); // Pausar el video
      }),
      this.socketService.onEvent(socketEvents.PLAY).subscribe(() => {
        this.youtubePlayer.playVideo(); // Reproducir el video
      }),
      /*  ESTAS DOS decreaseSpeed() y normalSpeed() NO EXISTEN EN youtube-player.ts
      this.socketService.onEvent(socketEvents.DECREASE_SPEED).subscribe(() => {
        this.youtubePlayer.decreaseSpeed(); // Disminuir la velocidad de reproducción
      }),
      this.socketService.onEvent(socketEvents.NOTHING).subscribe(() => {
        this.youtubePlayer.normalSpeed(); // Restablecer velocidad
      })
      */
    );
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
