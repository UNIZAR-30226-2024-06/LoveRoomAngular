import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Config } from '../utils';  // Configuración de la URL y otros parámetros.

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {
    this.socket = new Socket({
      url: Config.API_URL,
      options: {
        withCredentials: true,
      },
    });

    this.socket.onAny((event: string, ...args: any[]) => {
      console.log(event, args);
    });
  }

  emitEvent(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

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

  disconnect(): void {
    this.socket.disconnect();
  }
}
