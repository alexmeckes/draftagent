import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDraft(draftId: string) {
    if (this.socket) {
      this.socket.emit('join-draft', draftId);
    }
  }

  leaveDraft(draftId: string) {
    if (this.socket) {
      this.socket.emit('leave-draft', draftId);
    }
  }

  onDraftUpdate(callback: (update: any) => void) {
    if (this.socket) {
      this.socket.on('draft-update', callback);
    }
  }

  offDraftUpdate() {
    if (this.socket) {
      this.socket.off('draft-update');
    }
  }

  onDraftError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('draft-error', callback);
    }
  }

  offDraftError() {
    if (this.socket) {
      this.socket.off('draft-error');
    }
  }
}

export const socketService = new SocketService();