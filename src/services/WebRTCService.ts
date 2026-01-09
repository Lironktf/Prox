import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import { ICE_SERVERS } from '../constants/config';

interface PeerConnection {
  connection: RTCPeerConnection;
  userId: string;
}

class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: any = null;
  private onRemoteStream: ((userId: string, stream: any) => void) | null = null;
  private onIceCandidate: ((userId: string, candidate: any) => void) | null = null;

  async initializeLocalStream(): Promise<boolean> {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.localStream = stream;
      return true;
    } catch (error) {
      console.error('Error initializing local stream:', error);
      return false;
    }
  }

  createPeerConnection(userId: string): RTCPeerConnection {
    const configuration = { iceServers: ICE_SERVERS };
    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStream?.(userId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate?.(userId, event.candidate);
      }
    };

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}:`, peerConnection.connectionState);
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  async createOffer(userId: string): Promise<RTCSessionDescription | null> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      console.error('Peer connection not found for user:', userId);
      return null;
    }

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  async createAnswer(userId: string): Promise<RTCSessionDescription | null> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      console.error('Peer connection not found for user:', userId);
      return null;
    }

    try {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }

  async handleOffer(userId: string, offer: RTCSessionDescription): Promise<void> {
    let peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      peerConnection = this.createPeerConnection(userId);
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(userId: string, answer: RTCSessionDescription): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      console.error('Peer connection not found for user:', userId);
      return;
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(userId: string, candidate: any): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      console.error('Peer connection not found for user:', userId);
      return;
    }

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  closePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
  }

  closeAllConnections(): void {
    this.peerConnections.forEach((connection) => {
      connection.close();
    });
    this.peerConnections.clear();
  }

  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  setOnRemoteStream(callback: (userId: string, stream: any) => void): void {
    this.onRemoteStream = callback;
  }

  setOnIceCandidate(callback: (userId: string, candidate: any) => void): void {
    this.onIceCandidate = callback;
  }

  getPeerConnection(userId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(userId);
  }
}

export default new WebRTCService();
