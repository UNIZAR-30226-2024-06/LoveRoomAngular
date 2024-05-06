import { Injectable } from '@angular/core';
import { io} from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  readonly uri: string = 'http://'+environment.host_back;


  constructor() {
    this.socket = io(this.uri, {
      auth: {
        token: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  /*
  // Conecta el socket al servidor
  connect(): void {
    this.socket.connect();
  } */

  // Permite emitir eventos al servidor con un nombre de evento y datos asociados.
  emitEvent(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  // Escuchar el evento "MATCH"
  onMatch(): Observable<any> {
    return this.socket.fromEvent('MATCH');
  }

  // Devuelve un Observable que permite a los componentes suscribirse a eventos específicos y reaccionar a los datos recibidos
  listen(eventName: string): Observable<any> {
    return new Observable(observer => {
        this.socket.on(eventName, (senderId: string, receiverId: string, idSala: string, idVideo: string) => {
          observer.next({ senderId, receiverId, idSala, idVideo });
        });
      return () => this.socket.off(eventName);
    });
  }

  //Desconecta el socket manualmente
  disconnect(): void {
    this.socket.disconnect();
  }
}

