// BonenetSSEClient.ts
// =====================================================================
// Production-ready SSE client with a callback for all creeper events
// Additional logging added for debugging purposes

export interface CreeperEvent {
    uuid: string;
    creeperEventType: string;
    payload: string;
    epochTimestamp: number;
    playerId: string;
    audience: string;
}

export class BonenetSSEClient {
    private eventSource: EventSource | null = null;
    private baseUrl: string;
    private authToken: string;
    private eventCallback: ((event: CreeperEvent) => void) | null = null;
    private retryCount: number = 0;
    private maxRetries: number = 5;
    private retryDelay: number = 1000;

    constructor(baseUrl: string, authToken: string) {
        this.baseUrl = baseUrl;
        this.authToken = authToken;
    }

    public setEventCallback(callback: (event: CreeperEvent) => void) {
        this.eventCallback = callback;
    }

    public updateAuth(token: string) {
        this.authToken = token;
        // Restart connection with new token
        this.stop();
        this.start();
    }

    public start() {
        if (this.eventSource) {
            this.stop();
        }

        try {
            const url = `${this.baseUrl}?auth=${encodeURIComponent(this.authToken)}`;
            this.eventSource = new EventSource(url);

            this.eventSource.onopen = () => {
                console.log('[BonenetSSEClient] Connection established');
                this.retryCount = 0; // Reset retry count on successful connection
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (this.eventCallback) {
                        this.eventCallback(data);
                    }
                } catch (error) {
                    console.error('[BonenetSSEClient] Error parsing event data:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('[BonenetSSEClient] SSE error:', error);
                
                if (this.eventSource?.readyState === EventSource.CLOSED) {
                    this.handleReconnect();
                }
            };
        } catch (error) {
            console.error('[BonenetSSEClient] Error creating EventSource:', error);
            this.handleReconnect();
        }
    }

    private handleReconnect() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`[BonenetSSEClient] Attempting reconnect ${this.retryCount}/${this.maxRetries} in ${this.retryDelay}ms`);
            
            setTimeout(() => {
                this.stop();
                this.start();
            }, this.retryDelay * this.retryCount); // Exponential backoff
        } else {
            console.error('[BonenetSSEClient] Max retries reached, giving up');
        }
    }

    public stop() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}