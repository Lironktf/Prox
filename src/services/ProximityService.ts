import LocationService from './LocationService';
import WebRTCService from './WebRTCService';
import SignalingService from './SignalingService';
import { Location, ConnectionStatus } from '../types';

interface ProximityCallbacks {
  onStatusChange: (status: ConnectionStatus) => void;
  onLocationUpdate: (location: Location) => void;
  onUserConnected: (userId: string) => void;
  onUserDisconnected: (userId: string) => void;
  onError: (error: string) => void;
}

class ProximityService {
  private callbacks: Partial<ProximityCallbacks> = {};
  private currentLocation: Location | null = null;
  private currentRadius: number = 1;
  private isActive: boolean = false;

  async initialize(callbacks: ProximityCallbacks): Promise<boolean> {
    this.callbacks = callbacks;

    // Request location permissions
    const hasLocationPermission = await LocationService.requestPermissions();
    if (!hasLocationPermission) {
      this.callbacks.onError?.('Location permission denied');
      return false;
    }

    // Initialize WebRTC
    const hasAudioPermission = await WebRTCService.initializeLocalStream();
    if (!hasAudioPermission) {
      this.callbacks.onError?.('Microphone permission denied');
      return false;
    }

    // Set up WebRTC callbacks
    WebRTCService.setOnIceCandidate((userId, candidate) => {
      SignalingService.sendIceCandidate(userId, candidate);
    });

    WebRTCService.setOnRemoteStream((userId, stream) => {
      console.log('Received remote stream from:', userId);
    });

    return true;
  }

  async goOnline(radius: number): Promise<boolean> {
    if (this.isActive) {
      return true;
    }

    this.currentRadius = radius;
    this.callbacks.onStatusChange?.(ConnectionStatus.CONNECTING);

    // Get current location
    const location = await LocationService.getCurrentLocation();
    if (!location) {
      this.callbacks.onError?.('Failed to get location');
      this.callbacks.onStatusChange?.(ConnectionStatus.OFFLINE);
      return false;
    }

    this.currentLocation = location;
    this.callbacks.onLocationUpdate?.(location);

    // Connect to signaling server
    SignalingService.connect({
      onConnected: (userId) => {
        console.log('Connected with ID:', userId);
        this.startLocationTracking();
        this.callbacks.onStatusChange?.(ConnectionStatus.ONLINE);
        this.isActive = true;
      },
      onDisconnected: () => {
        this.callbacks.onStatusChange?.(ConnectionStatus.OFFLINE);
        this.isActive = false;
      },
      onUserJoined: async (userId) => {
        console.log('New user in range:', userId);
        await this.connectToPeer(userId);
      },
      onUserLeft: (userId) => {
        console.log('User left range:', userId);
        this.disconnectFromPeer(userId);
      },
      onOffer: async (userId, offer) => {
        await WebRTCService.handleOffer(userId, offer);
        const answer = await WebRTCService.createAnswer(userId);
        if (answer) {
          SignalingService.sendAnswer(userId, answer);
        }
      },
      onAnswer: async (userId, answer) => {
        await WebRTCService.handleAnswer(userId, answer);
      },
      onIceCandidate: async (userId, candidate) => {
        await WebRTCService.handleIceCandidate(userId, candidate);
      },
      onUsersInRange: (userIds) => {
        console.log('All users in range:', userIds);
      },
    });

    // Send initial location
    SignalingService.updateLocation(location, radius);

    return true;
  }

  goOffline(): void {
    if (!this.isActive) {
      return;
    }

    LocationService.stopTracking();
    WebRTCService.closeAllConnections();
    SignalingService.disconnect();
    this.isActive = false;
    this.callbacks.onStatusChange?.(ConnectionStatus.OFFLINE);
  }

  updateRadius(radius: number): void {
    this.currentRadius = radius;
    if (this.isActive && this.currentLocation) {
      SignalingService.updateLocation(this.currentLocation, radius);
    }
  }

  private startLocationTracking(): void {
    LocationService.startTracking((location) => {
      this.currentLocation = location;
      this.callbacks.onLocationUpdate?.(location);

      if (this.isActive) {
        SignalingService.updateLocation(location, this.currentRadius);
      }
    });
  }

  private async connectToPeer(userId: string): Promise<void> {
    WebRTCService.createPeerConnection(userId);
    const offer = await WebRTCService.createOffer(userId);
    if (offer) {
      SignalingService.sendOffer(userId, offer);
      this.callbacks.onUserConnected?.(userId);
    }
  }

  private disconnectFromPeer(userId: string): void {
    WebRTCService.closePeerConnection(userId);
    this.callbacks.onUserDisconnected?.(userId);
  }

  isOnline(): boolean {
    return this.isActive;
  }

  cleanup(): void {
    this.goOffline();
    WebRTCService.stopLocalStream();
  }
}

export default new ProximityService();
