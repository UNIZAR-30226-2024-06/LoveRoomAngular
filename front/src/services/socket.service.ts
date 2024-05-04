import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

// Define una interfaz para el estado del socket
interface SocketState {
  socket: Socket | null;
  senderId: string;
  receiverId: string;
  idSala: string;
  idVideo: string;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  send(arg0: { type: string; idSala: any; }) {
    throw new Error('Method not implemented.');
  }
  private socket: Socket | null = null;
  private socketState = new BehaviorSubject<SocketState>({
    socket: null,
    senderId: '',
    receiverId: '',
    idVideo: '',
    idSala: ''
  });

  constructor() {}

  // Inicializar el socket con el token del usuario
  initializeSocket(token: string): void {
    this.socket = io(environment.host_back, {
      auth: {
        token: `Bearer ${token}`
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket');
      this.socket!.on('MATCH', (senderId: string, receiverId: string, idSala: string, idVideo: string) => {
        console.log('Match event received:', receiverId, senderId, idSala, idVideo);
        const newState: SocketState = {
          socket: this.socket,
          senderId: receiverId,
          receiverId: senderId,
          idSala: idSala.toString(),
          idVideo: idVideo
        };
        this.socketState.next(newState);
      });
    });
  }

  getSocketState() {
    return this.socketState.asObservable();
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null; // Asegúrate de resetear el estado
    }
    // Actualiza el BehaviorSubject después de desconectar
    this.socketState.next({
      socket: null,
      senderId: '',
      receiverId: '',
      idVideo: '',
      idSala: ''
    });
  }
}
