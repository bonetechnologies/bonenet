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
    private authToken: string | null;
    private eventCallback: (event: CreeperEvent) => void;

    constructor(
        private baseUrl: string,
        authToken?: string,
        eventCallback?: (event: CreeperEvent) => void
    ) {
        this.authToken = authToken || null;
        this.eventCallback = eventCallback || (() => {});
    }

    private buildUrl(): string {
        let url = this.baseUrl;
        if (this.authToken) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}auth=${encodeURIComponent(this.authToken)}`;
        }
        return url;
    }

    public start(): void {
        if (this.eventSource) {
            return;
        }
        const url = this.buildUrl();

        this.eventSource = new EventSource(url);

        // Track when the connection is opened
        this.eventSource.onopen = () => {
        };

        // Track messages
        this.eventSource.onmessage = (event: MessageEvent) => {
            try {
                const data: CreeperEvent = JSON.parse(event.data);
                this.eventCallback(data);
            } catch (error) {
                console.error('  Error parsing SSE event data:', error);
            }
        };

        // Track errors
        this.eventSource.onerror = (error: any) => {
            console.error('[BonenetSSEClient] SSE error:', error);
        };
    }

    public stop(): void {
        if (this.eventSource) {
            console.log('  Closing existing SSE connection.');
            this.eventSource.close();
        } else {
            console.log('  No existing SSE connection to close.');
        }
        this.eventSource = null;
    }

    public updateAuth(authToken: string | null): void {
        if (this.authToken !== authToken) {
            this.authToken = authToken;
            console.log('  Auth token changed. Restarting SSE connection...');
            this.stop();

            if (this.authToken) {
                this.start();
            } else {
                console.log('  Auth token removed, SSE not restarted.');
            }
        } else {
            console.log('  Auth token unchanged, doing nothing.');
        }
    }

    public setEventCallback(callback: (event: CreeperEvent) => void): void {
        this.eventCallback = callback;
    }
}