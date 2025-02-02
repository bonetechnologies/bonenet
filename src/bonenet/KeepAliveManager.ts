// KeepAliveManager.ts
export class KeepAliveManager {
    private intervalId: number | null = null;

    /**
     * @param socket The WebSocket to keep alive.
     * @param intervalMs How often (in milliseconds) to send a ping.
     * @param pingMessage The ping message to send.
     */
    constructor(
        private socket: WebSocket,
        private intervalMs: number = 10000,
        private pingMessage: string = 'ping'
    ) {}

    public start() {
        this.stop(); // Clear any existing interval
        this.intervalId = window.setInterval(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(this.pingMessage);
            }
        }, this.intervalMs);
    }

    public stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}