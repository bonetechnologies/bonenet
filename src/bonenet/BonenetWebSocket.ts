// BonenetWebSocket.ts
import { KeepAliveManager } from './KeepAliveManager';

export type BonenetWSMessageHandler = (data: string) => void;
export type BonenetWSAuthHandler = (token: string) => void;
export type BonenetWSEventHandler = (event: Event) => void;
export type BonenetWSCloseHandler = (event: CloseEvent) => void;

export class BonenetWebSocket {
    private socket: WebSocket | null = null;
    private keepAliveManager: KeepAliveManager | null = null;

    constructor(private url: string) {}

    public connect(
        onOpen?: BonenetWSEventHandler,
        onMessage?: BonenetWSMessageHandler,
        onAuth?: BonenetWSAuthHandler,
        onClose?: BonenetWSCloseHandler,
        onError?: BonenetWSEventHandler
    ): void {
        this.socket = new WebSocket(this.url);
        this.socket.onopen = (event: Event) => {
            if (onOpen) onOpen(event);
            // Start the keep-alive manager (non-null assertion is safe here because socket is set)
            this.keepAliveManager = new KeepAliveManager(this.socket!, 10000, 'ping');
            this.keepAliveManager.start();
        };

        this.socket.onmessage = (event: MessageEvent) => {
            const data = typeof event.data === 'string' ? event.data : '[Non-string data]';
            // Ignore "pong" responses (keep-alive responses)
            if (data.trim() === 'pong') return;
            // If the message starts with "AUTH - ", extract and send the token via onAuth callback.
            if (data.startsWith('AUTH - ')) {
                const token = data.substring(7).trim();
                if (onAuth) onAuth(token);
            } else {
                if (onMessage) onMessage(data);
            }
        };

        this.socket.onclose = (event: CloseEvent) => {
            if (this.keepAliveManager) {
                this.keepAliveManager.stop();
                this.keepAliveManager = null;
            }
            if (onClose) onClose(event);
        };

        this.socket.onerror = (event: Event) => {
            if (onError) onError(event);
        };
    }

    public send(message: string): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
    }

    public close(): void {
        if (this.socket) {
            this.socket.close();
        }
    }

    public getSocket(): WebSocket | null {
        return this.socket;
    }
}