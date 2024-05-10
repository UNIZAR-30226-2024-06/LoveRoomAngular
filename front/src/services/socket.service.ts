import { Injectable } from '@angular/core';
import io from "socket.io-client";
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { socketEvents } from '../environments/socketEvents';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  private static instance: SocketService;

  constructor() {}

  //Metodo para obtener una unica instancia de la clase
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance
  }

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

  // Método para emitir eventos Join y Leave
  public emitJoinLeave(eventName: string, idSala: string): void {
    if (this.socket) {
      this.socket.emit(eventName, idSala);
    }
  }

  // Método para emitir eventos Play y Pause
  public emitPlayPause(eventName: string, salaId: string): void {
    this.socket.emit(eventName, salaId, (success: boolean) => {
      if (success) {
        console.log(`${eventName} event successful in room ${salaId}`);
      } else {
        console.error(`Error emitting ${eventName} event in room ${salaId}`);
      }
    });
  }

  // Método para escuchar eventos de PLAY y PAUSE
  public listenPausePlay(eventName: string): Observable<void> {
    return new Observable<void>((observer) => {
      this.socket.on(eventName, () => {
        observer.next();
      });
      return () => this.socket.off(eventName); // Limpiar al desuscribirse
    });
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

  public onSyncEvent(eventName: string): Observable<any> {
    if(eventName === socketEvents.SYNC_ON ){
      return new Observable(observer => {
        this.socket.on(socketEvents.SYNC_ON,(idvideo: string, tiemposegundos: number,pausado: boolean, conectado: boolean) => {
          observer.next({idvideo, tiemposegundos, pausado, conectado });
        });
        return () => this.socket.off(socketEvents.SYNC_ON);
      });
    }else{
      return new Observable(observer => {
        this.socket.on(socketEvents.SYNC_OFF, () => {
          observer.next(true);
        });
      });
    }
  }

  public onGetSyncEvent(): Observable<any> {
    return new Observable(observer => {
      this.socket.on(socketEvents.GET_SYNC, (idSala: string) => {
        observer.next({idSala});
      });
    });
  }

  public onChangeVideoEvent(): Observable<any> {
    return new Observable(observer => {
      this.socket.on(socketEvents.CHANGE_VIDEO, (idVideo: string) => {
        observer.next({idVideo});
      });
    });
  }

}
