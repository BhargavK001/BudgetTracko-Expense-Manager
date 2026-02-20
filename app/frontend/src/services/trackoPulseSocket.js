import { io } from 'socket.io-client';

class TrackoPulseSocket {
    constructor() {
        this.socket = null;
    }

    connect() {
        // If a socket instance already exists (connected OR still connecting/handshaking),
        // do NOT touch it. React 18 StrictMode double-mounts effects in dev, so without
        // this guard the second mount would kill a socket mid-WebSocket-upgrade.
        if (this.socket) {
            return;
        }

        // Force port 5000 for local development to bypass Vite proxy dropping websocket headers
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Auth is cookie-based: the HTTP-only 'token' cookie is sent automatically
        // via withCredentials: true during the WebSocket handshake
        this.socket = io(`${backendUrl}/tracko-pulse`, {
            withCredentials: true,
            transports: ['websocket']
        });

        this.socket.on('connect', () => {
            console.log('[Tracko Pulse] Connected to AI WebSocket');
        });

        this.socket.on('disconnect', () => {
            console.log('[Tracko Pulse] Disconnected from AI WebSocket');
        });

        this.socket.on('connect_error', (err) => {
            console.error('[Tracko Pulse] Connection Error:', err.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    askQuestion(question, chatHistory, onStatusUpdate, onResponse, onError) {
        if (!this.socket || !this.socket.connected) {
            if (onError) onError(new Error("Socket not connected. Please refresh."));
            return;
        }

        // Attach one-time listeners for this specific question flow
        const handleStatus = (data) => {
            if (onStatusUpdate) onStatusUpdate(data);
        };

        const handleResponse = (data) => {
            this.cleanupListeners(handleStatus, handleResponse, handleError);
            if (onResponse) onResponse(data);
        };

        const handleError = (errorData) => {
            this.cleanupListeners(handleStatus, handleResponse, handleError);
            if (onError) onError(new Error(errorData.message || "Unknown socket error"));
        };

        this.socket.on('status', handleStatus);
        this.socket.on('response', handleResponse);
        this.socket.on('error', handleError);

        // Send the question and recent chat history for context
        this.socket.emit('ask_question', { question, chatHistory });
    }

    cleanupListeners(statusFn, responseFn, errorFn) {
        if (!this.socket) return;
        this.socket.off('status', statusFn);
        this.socket.off('response', responseFn);
        this.socket.off('error', errorFn);
    }
}

// Export as singleton so the connection scales securely across the app
export const trackoPulseSocket = new TrackoPulseSocket();
