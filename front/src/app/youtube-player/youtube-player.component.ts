import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-youtube-player',
  template: `<div #youtubePlayer></div>`, // Lugar donde se mostrará el reproductor
})
export class YouTubePlayerComponent implements OnInit {
  @ViewChild('youtubePlayer') youtubePlayer!: ElementRef; // Referencia al elemento del DOM
  
  ngOnInit() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api'; // Carga la API de YouTube
    document.body.appendChild(script);

    script.onload = () => {
      window['onYouTubeIframeAPIReady'] = () => {
        this.initPlayer(); // Función para inicializar el reproductor
      };
    };
  }

  initPlayer() {
    new YT.Player(this.youtubePlayer.nativeElement, {
      height: '390',
      width: '640',
      videoId: 'VIDEO_ID', // El ID del video que deseas reproducir
    });
  }
}
