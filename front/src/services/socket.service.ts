import { Injectable } from '@angular/core';
import io from "socket.io-client";
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor() {}

  // Método para conectar al socket
  public connect(): void {
    if (!this.socket) { // Solo conecta si socket no existe ya
      this.socket = io(`http://${environment.host_back}`, {
        auth: {
          token: `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Método para emitir eventos al servidor
  public emitEvent(eventName: string, data: any): void {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }

  // Sirver para escuchar el evento MATCH, no se si servira para el resto por el tema de los paramtros
  public onMatchEvent(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (senderId: string, receiverId: string, idSala: string, idVideo: string) => {
        observer.next({ senderId, receiverId, idSala, idVideo });
      });
      return () => this.socket.off(eventName); // Limpiar al desuscribirse
    });
  }
}
