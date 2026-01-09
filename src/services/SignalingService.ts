import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../constants/config';
import { Location } from '../types';

interface SignalingCallbacks {
  onConnected: (userId: string) => void;
  onDisconnected: () => void;
  onUserJoined: (userId: string) => void;
  onUserLeft: (userId: string) => void;
  onOffer: (userId: string, offer: any) => void;
  onAnswer: (userId: string, answer: any) => void;
  onIceCandidate: (userId: string, candidate: any) => void;
  onUsersInRange: (userIds: string[]) => void;
}

class SignalingService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private callbacks: Partial<SignalingCallbacks> = {};

  connect(callbacks: SignalingCallbacks): void {
    this.callbacks = callbacks;

    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    this.socket.on('connected', (userId: string) => {
      console.log('Received user ID:', userId);
      this.userId = userId;
      this.callbacks.onConnected?.(userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.callbacks.onDisconnected?.();
    });

    this.socket.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
      this.callbacks.onUserJoined?.(userId);
    });

    this.socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      this.callbacks.onUserLeft?.(userId);
    });

    this.socket.on('offer', (data: { userId: string; offer: any }) => {
      console.log('Received offer from:', data.userId);
      this.callbacks.onOffer?.(data.userId, data.offer);
    });

    this.socket.on('answer', (data: { userId: string; answer: any }) => {
      console.log('Received answer from:', data.userId);
      this.callbacks.onAnswer?.(data.userId, data.answer);
    });

    this.socket.on('ice-candidate', (data: { userId: string; candidate: any }) => {
      console.log('Received ICE candidate from:', data.userId);
      this.callbacks.onIceCandidate?.(data.userId, data.candidate);
    });

    this.socket.on('users-in-range', (userIds: string[]) => {
      console.log('Users in range:', userIds);
      this.callbacks.onUsersInRange?.(userIds);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  updateLocation(location: Location, radius: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('update-location', { location, radius });
    }
  }

  sendOffer(userId: string, offer: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('offer', { userId, offer });
    }
  }

  sendAnswer(userId: string, answer: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('answer', { userId, answer });
    }
  }

  sendIceCandidate(userId: string, candidate: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ice-candidate', { userId, candidate });
    }
  }

  getUserId(): string | null {
    return this.userId;
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}

export default new SignalingService();
