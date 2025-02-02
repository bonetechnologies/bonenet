export interface CreeperEvent {
    creeperEventType: string;
    // Additional fields if needed, e.g. message, payload, etc.
}

export class BonenetSSEClient {
    private eventSource: EventSource | null = null;
    private authToken: string | null;

    /**
     * @param baseUrl  The base URL of the SSE endpoint (e.g., "http://example.com/api/events").
     * @param authToken  Optional auth token appended as a query parameter.
     */
    constructor(
        private baseUrl: string,
        authToken?: string
    ) {
        this.authToken = authToken || null;
    }

    /**
     * Builds the full URL by appending the authentication token (if present) as a query parameter.
     */
    private buildUrl(): string {
        let url = this.baseUrl;
        if (this.authToken) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}auth=${encodeURIComponent(this.authToken)}`;
        }
        return url;
    }

    /**
     * Starts the SSE connection if one is not already open.
     */
    public start(): void {
        if (this.eventSource) {
            console.log('SSE connection already open.');
            return;
        }

        const url = this.buildUrl();
        console.log('Connecting to SSE endpoint:', url);

        // Because we do NOT need cookies or credentials, we just create a plain EventSource:
        this.eventSource = new EventSource(url);

        this.eventSource.onopen = (event: Event) => {
            console.log('SSE connection opened', event);
        };

        this.eventSource.onmessage = (event: MessageEvent) => {
            console.log("⚡ [onmessage] Raw SSE Event Received:", event.data);
            try {
                console.log("⚡ [onmessage] Raw SSE Event Received:", event.data);
                const data: CreeperEvent = JSON.parse(event.data);
                console.log('Received event type:', data.creeperEventType, data);
            } catch (error) {
                console.error('Error parsing SSE event data:', error);
            }
        };


        this.eventSource.addEventListener("message", (event: MessageEvent) => {
            console.log('⚡ [addEventListener] Raw SSE Event Received:', event.data);
        });

        this.eventSource.onerror = (error: any) => {
            console.error('SSE error:', error);
            // Optionally close the connection on error:
            // this.stop();
        };
    }

    /**
     * Stops (closes) the SSE connection.
     */
    public stop(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            console.log('SSE connection closed');
        }
    }

    /**
     * Updates the auth token. If the token changes, the connection is restarted.
     */
    public updateAuth(authToken: string | null): void {
        if (this.authToken !== authToken) {
            this.authToken = authToken;
            console.log('Auth token updated. Restarting SSE connection.');
            this.stop();
            if (this.authToken) {
                this.start();
            }
        }
    }
}