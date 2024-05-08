import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import io from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket = io(`http://${environment.host_back}`, {
    auth: {
      token: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  constructor() {}

  /*getDatosPacientes(): Observable<any> {
    return new Observable<any>((observer) => {
      // Escuchar el evento 'datos' del servidor
      this.socket.on("datos", (data: any) => {
        observer.next(data); // Enviar los datos recibidos a los suscriptores
      });

      // Manejar la desconexión
      return () => {
        this.socket.disconnect();
      };
    });
  }

  getPacientesPorGenero(): Observable<any> {
    return new Observable<any>((observer) => {
      // Escuchar el evento 'pacientesPorGenero' del servidor
      this.socket.on("pacientesPorGenero", (data: any) => {
        observer.next(data); // Enviar los datos recibidos a los suscriptores
      });

      // Manejar la desconexión
      return () => {
        this.socket.disconnect();
      };
    });
  }*/

  /*public disconnect(): void {
    if(this.socket){
      this.socket.on("disconnect", () => {
        alert(this.socket); // undefined
      });
    }
  }

  // Permite emitir eventos al servidor con un nombre de evento y datos asociados.
  emitEvent(eventName: string, data: any): void {
    if(this.socket){
      this.socket.emit(eventName, data);
    }
  }*/

  /*
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
  } */

}

