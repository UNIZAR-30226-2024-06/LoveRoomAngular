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

  // Devuelve un Observable que permite a los componentes suscribirse a eventos específicos y reaccionar a los datos recibidos
  onEvent(eventName: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(eventName, (data: any) => {
        observer.next(data);
      });

      return () => {
        this.socket.off(eventName);
      };
    });
  }

  //Desconecta el socket manualmente
  disconnect(): void {
    this.socket.disconnect();
  }
}

