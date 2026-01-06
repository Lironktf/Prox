export interface Location {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  location: Location;
  radius: number;
}

export interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
}

export enum ConnectionStatus {
  OFFLINE = 'offline',
  CONNECTING = 'connecting',
  ONLINE = 'online',
}

export interface AppState {
  status: ConnectionStatus;
  radius: number;
  location: Location | null;
  connectedUsers: string[];
}

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  text: string;
  border: string;
  circleBackground: string;
  onlineColor: string;
  offlineColor: string;
  sliderTrack: string;
  sliderThumb: string;
}
