import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketManager {
  private socket: Socket | null = null;
  private connected = false;

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Room management
  joinPlayerRoom(playerId: string) {
    this.emit('join-player-room', playerId);
  }

  // Painting events
  startPainting(data: { spotId: string }) {
    this.emit('start-painting', data);
  }

  sendStrokeUpdate(data: any) {
    this.emit('stroke-update', data);
  }

  sendStealthUpdate(data: any) {
    this.emit('stealth-update', data);
  }

  reportRiskEvent(data: any) {
    this.emit('risk-event', data);
  }

  triggerPoliceAlert(data: any) {
    this.emit('police-alert', data);
  }

  // Listeners
  onPaintingStarted(callback: (data: any) => void) {
    this.on('painting-started', callback);
  }

  onStrokeAdded(callback: (data: any) => void) {
    this.on('stroke-added', callback);
  }

  onStealthChanged(callback: (data: any) => void) {
    this.on('stealth-changed', callback);
  }

  onNewRiskEvent(callback: (data: any) => void) {
    this.on('new-risk-event', callback);
  }

  onPoliceTriggered(callback: (data: any) => void) {
    this.on('police-triggered', callback);
  }

  // Generic emit/on
  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketManager = new SocketManager();
export default socketManager;
