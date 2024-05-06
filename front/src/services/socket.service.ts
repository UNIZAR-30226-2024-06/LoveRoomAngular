import { Injectable } from '@angular/core';
import { io, Socket} from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { SocketIoConfig } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket = null!;

  constructor() {
  }

  
  // Conecta el socket al servidor
  public connect(): void {
    const token = localStorage.getItem('token');  // Obtener el token de autenticación guardado
    alert(token);
    this.socket = io(`http://${environment.host_back}`, {
      auth: {
        token: `Bearer ${token}`  // Enviar el token como parte de la autenticación
      }
    });
    alert(environment.host_back);
    // escuchando el evento connect que se emite cuando el socket se conecta con éxito al servidor. Se muestra la alerta si hay una conexion con exito
    this.socket.on("connect", () => {
    alert(this.socket.id); // Si conectara deberiamos poder ver 
});

/*this.socket.on("connect_error", (error) => {
  if (this.socket.active) {
    alert("Socoket supuestamente activo");
  } else {
    // the connection was denied by the server
    // in that case, `socket.connect()` must be manually called in order to reconnect
    alert("Conexion denegada");
    console.log(error.message);
  }
});*/
    alert("Intento conectar el socket");
  }

  public disconnect(): void {
    this.socket.on("disconnect", () => {
      alert(this.socket.id); // undefined
    });
  }

  // Permite emitir eventos al servidor con un nombre de evento y datos asociados.
  emitEvent(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

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

