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

  public emitTiempo(eventName: string, idSala: string, timesegundos: number): void {
    this.socket.emit(eventName, idSala, timesegundos, (response: any) => {
      if (response.success) {
        console.log('Tiempo actualizado con éxito en el servidor.');
      } else {
        console.error('Error al actualizar el tiempo en el servidor:', response.message);
      }
    });
  }

  // Método para emitir un cambio de video en una sala
  public emitChangeVideo(eventName: string, idSala: string, idVideo: string): void {
    this.socket.emit(eventName, idSala, idVideo, (success: boolean) => {
      console.log(success ? 'Video cambiado con éxito' : 'Error al cambiar el video');
    });
  }

  // Método para escuchar cambios de video en la sala
  public listenChangeVideo(eventName: string): Observable<string> {
    return new Observable(observer => {
      this.socket.on(eventName, (idVideo: string) => {
        observer.next(idVideo);
      });
      return () => this.socket.off(socketEvents.CHANGE_VIDEO);
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

  public emitGetSync(eventName: string, idSala: string): void {
    if(this.socket) {
      this.socket.emit(eventName, idSala)
    }
  }

  public listenGetSync(eventName: string) : Observable<void> {
    return new Observable<void>((observer) => {
      this.socket.on(eventName, () => {
        observer.next();
      });
      return () => this.socket.off(eventName); // Limpiar al desuscribirse
    });
  }

  // Sirve para emitir el evento de sincronización
  public emitSyncOn(eventName: string, idSala: string, idVideo: string, timesegundos: number, pausado: boolean): void {
    this.socket.emit(eventName, idSala, idVideo, timesegundos, pausado, (success: any) => {
      console.log(success ? 'Get Sync emitido con éxito' : 'Error al emitir Get Sync');
    });
  }

  public emitSyncOff(eventName: string, idSala: string){
    this.socket.emit(eventName, idSala, (success: boolean) => {
      console.log(success ? 'Enviado SyncOff' : 'Error al enviar SyncOff');
    });
  }

  // Sirve para escuchar el evento de obtener sincronización
  public ListenSyncEvent(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (idVideo: string, timesegundos: number, pausado: boolean, otroUsuarioOnline: boolean) => {
        observer.next({ idVideo, timesegundos, pausado});
      });
      return () => this.socket.off(eventName);
    });
  }

  public ListenSyncOff(eventName: string): Observable<void> {
    return new Observable<void>((observer) => {
      this.socket.on(eventName, () => {
        observer.next();
      });
      return () => this.socket.off(eventName); // Limpiar al desuscribirse
    });
  }

  public emitCreateMessage(eventName: string, idSala: string, texto: string, rutaMultimedia: string | null){
    this.socket.emit(eventName, idSala, texto, rutaMultimedia, (success: boolean, idMsg: number, timestamp: Date | null) => {
      console.log(success ? 'Mensaje enviado con éxito' : 'Error al enviar mensaje');
    });
  }

  public listenReceiveMessage(eventName: string): Observable<any>{
    return new Observable(observer => {
      this.socket.on(eventName, (idMsg: number, idSender: string, texto: string, rutaMultimedia: string, fechaHora: Date) => {
        observer.next({idMsg, texto, rutaMultimedia});
        console.log('Mensaje recibido de: ', idSender);
        console.log('Texto del mensaje: ', texto);
        console.log('Ruta multimedia: ', rutaMultimedia);
      });
      return () => this.socket.off(eventName);
    });
  }


  public listenUnmatch(eventName: string): Observable<any>{
    return new Observable(observer => {
      this.socket.on(eventName, (idSala: string) => {
        observer.next({idSala});
      });
      return () => this.socket.off(eventName);
    });
  }
}
