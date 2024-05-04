import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { socketEvents } from '../environments/socketEvents';

// Define una interfaz para el estado del socket
interface SocketState {
  socket: Socket | null;
  senderId: string;
  receiverId: string;
  idSala: string;
  idVideo: string;
  play?: boolean;  // Opcional, indica si el video está en reproducción
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
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
      this.socket!.on(socketEvents.MATCH, (senderId: string, receiverId: string, idSala: string, idVideo: string) => {
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

  send(message: { type: string; idSala: string }): void {
    if (!this.socket) {
      console.error('Socket is not initialized');
      return;
    }
    if (message.type == 'PLAY'){
      console.log('Emitiendo PLAY')
      this.socket.emit(socketEvents.PLAY, message.idSala)
    }
    else if (message.type == 'PAUSE'){
      console.log('Emitiendo PAUSE')
      this.socket.emit(socketEvents.PAUSE, message.idSala)
    }
    else if (message.type == 'JOIN_ROOM'){
      console.log('Emitiendo JOIN_ROOM')
      this.socket.emit(socketEvents.JOIN_ROOM, message.idSala)
    }
  }

  public listenToEvents() {
    this.socket?.on('PLAY', () => {
      this.socketState.next({...this.socketState.value, play: true});
    });
    this.socket?.on('PAUSE', () => {
      this.socketState.next({...this.socketState.value, play: false});
    });
  }

  public leaveRoom(idSala: string): void {
    if (this.socket && idSala) {
      this.socket.emit(socketEvents.LEAVE_ROOM, idSala);
      console.log(`Left room: ${idSala}`);
    }
  }

  public cleanUpListeners() {
    this.socket?.off(socketEvents.PLAY);
    this.socket?.off(socketEvents.PAUSE);
  }
}

