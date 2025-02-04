// BonenetWebSocket.ts
import { KeepAliveManager } from './KeepAliveManager';

export type BonenetWSMessageHandler = (data: string) => void;
export type BonenetWSAuthHandler = (token: string) => void;
export type BonenetWSEventHandler = (event: Event) => void;
export type BonenetWSCloseHandler = (event: CloseEvent) => void;

export class BonenetWebSocket {
    private socket: WebSocket | null = null;
    private keepAliveManager: KeepAliveManager | null = null;
    private isConnected: boolean = false;
    private isAuthenticated: boolean = false;
    private messageQueue: string[] = [];

    constructor(private url: string) {}

    public connect(
        onOpen?: BonenetWSEventHandler,
        onMessage?: BonenetWSMessageHandler,
        onAuth?: BonenetWSAuthHandler,
        onClose?: BonenetWSCloseHandler,
        onError?: BonenetWSEventHandler
    ): void {
        if (this.socket) {
            this.close();
        }

        this.socket = new WebSocket(this.url);
        
        this.socket.onopen = (event: Event) => {
            this.isConnected = true;
            if (onOpen) onOpen(event);
            // Start the keep-alive manager
            this.keepAliveManager = new KeepAliveManager(this.socket!, 10000, 'ping');
            this.keepAliveManager.start();
            
            // Process any queued messages
            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                if (msg) this.send(msg);
            }
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const data = typeof event.data === 'string' ? event.data : '[Non-string data]';
            
            // Ignore "pong" responses (keep-alive responses)
            if (data.trim() === 'pong') return;
            
            // If the message starts with "AUTH - ", extract and send the token via onAuth callback.
            if (data.startsWith('AUTH - ')) {
                const token = data.substring(7).trim();
                this.isAuthenticated = true;
                if (onAuth) onAuth(token);
            } else {
                if (onMessage) onMessage(data);
            }
        };

        this.socket.onclose = (event: CloseEvent) => {
            this.isConnected = false;
            this.isAuthenticated = false;
            if (this.keepAliveManager) {
                this.keepAliveManager.stop();
                this.keepAliveManager = null;
            }
            if (onClose) onClose(event);
        };

        this.socket.onerror = (event: Event) => {
            this.isConnected = false;
            this.isAuthenticated = false;
            if (onError) onError(event);
        };
    }

    public send(message: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.messageQueue.push(message);
            return;
        }

        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(message);
            } catch (error) {
                console.warn('Failed to send message:', error);
                this.messageQueue.push(message);
            }
        } else {
            this.messageQueue.push(message);
        }
    }

    public close(): void {
        this.messageQueue = [];
        this.isConnected = false;
        this.isAuthenticated = false;
        if (this.keepAliveManager) {
            this.keepAliveManager.stop();
            this.keepAliveManager = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    public getSocket(): WebSocket | null {
        return this.socket;
    }

    public isSocketConnected(): boolean {
        return this.isConnected && this.isAuthenticated && this.socket?.readyState === WebSocket.OPEN;
    }
}