import { Injectable } from '@angular/core';
import { io} from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    const config: SocketIoConfig = { url: 'http://'+environment.host_back, options: { withCredentials: true } };
    this.socket = new Socket(config);

    // Este método se usa para registrar un listener que responde a cualquier evento emitido por el servidor, imprimiendo los eventos y sus datos en la consola. Esto es útil para depuración
    this.socket.onAny((event: string, ...args: any[]) => {
      console.log(event, args);
    });
  }

  // Permite emitir eventos al servidor con un nombre de evento y datos asociados.
  emitEvent(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  // Método para escuchar eventos específicos
  onEvent(eventName: string): Observable<any> {
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

