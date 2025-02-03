// BonenetApiClient.ts

/**
 * A client for making HTTP calls to the Bonenet/Creeper server,
 * mirroring the Java CreeperApiHttpClient but using fetch in TypeScript/React.
 *
 * The server expects Basic Auth, where authToken is already base64-encoded:
 *    "Authorization": "Basic <base64-encoded-credentials>"
 */

export interface NameValuePair {
    [key: string]: string;
}

export class BonenetApiClient {
    private baseUrl: string;
    private authToken: string;

    /**
     * @param baseUrl   The base API URL, e.g. "https://xterm.bonenet.ai/api"
     * @param authToken The base64-encoded token from the server (username:password style).
     */
    constructor(baseUrl: string, authToken: string) {
        this.baseUrl = baseUrl;
        this.authToken = authToken;
    }

    /**
     * If you need to update the auth token later (e.g. re-login).
     */
    public updateAuthToken(newToken: string) {
        this.authToken = newToken;
    }

    /**
     * Utility method for POST calls with form-like data.
     *   endpoint: "gossip", "move", "look", etc.
     *   formFields: object representing the fields to be sent (key-value pairs).
     */
    private async post(endpoint: string, formFields?: NameValuePair): Promise<Response> {
        const url = `${this.baseUrl}/${endpoint}`;
        const headers: Record<string, string> = {
            // <-- Basic Auth with an already Base64-encoded token
            'Authorization': `Basic ${this.authToken}`
        };

        // For form-like data: we send application/x-www-form-urlencoded
        const body = formFields
            ? new URLSearchParams(Object.entries(formFields)).toString()
            : undefined;

        headers['Content-Type'] = 'application/x-www-form-urlencoded';

        return fetch(url, {
            method: 'POST',
            headers,
            body
        });
    }

    /**
     * Utility method for GET calls.
     */
    private async get(endpoint: string): Promise<Response> {
        const url = `${this.baseUrl}/${endpoint}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${this.authToken}`
            }
        });
    }

    // -------------------------------------------------------------------------
    // Endpoints (mirroring the Java code)
    // -------------------------------------------------------------------------

    /**
     * Immediately retrieve initial state from the server (similar to 'seedEvents' in Java).
     * This helps populate things like the map for which you’re waiting for DRAW_MAP events.
     */
    public async seedEvents(): Promise<void> {
        await this.post('seed');
    }

    /**
     *  Send a gossip message to the server.
     */
    public async gossip(message: string): Promise<void> {
        await this.post('gossip', { message });
    }

    /**
     *  Use an item from your inventory.
     */
    public async useItem(itemId: string): Promise<void> {
        await this.post('use', { itemId });
    }

    /**
     *  Drop an item from your inventory.
     */
    public async dropItem(itemId: string): Promise<void> {
        await this.post('drop', { itemId });
    }

    /**
     *  Equip an item in your inventory.
     */
    public async equip(itemId: string): Promise<void> {
        await this.post('equip', { itemId });
    }

    /**
     *  Show an item to others (e.g., show item in chat).
     */
    public async show(itemId: string): Promise<void> {
        await this.post('show', { itemId });
    }

    /**
     *  Look at either an NPC or another player.
     *  If both are omitted, it might do a default "look around" – depends on your server logic.
     */
    public async look(npcId?: string, playerId?: string): Promise<void> {
        const form: NameValuePair = {};
        if (npcId) form['npcId'] = npcId;
        if (playerId) form['playerId'] = playerId;
        await this.post('look', form);
    }

    /**
     *  Move in a direction. Typical directions might be "north", "south", etc.
     */
    public async move(direction: string): Promise<void> {
        await this.post('move', { direction });
    }

    /**
     *  Attack a specific NPC by ID.
     */
    public async attackNpc(npcId: string): Promise<void> {
        await this.post('attack', { npcId });
    }

    /**
     *  Pick (pick up) an item from the ground.
     */
    public async pick(itemId: string): Promise<void> {
        await this.post('pick', { itemId });
    }

    /**
     *  Compare your stats with another player.
     */
    public async compare(playerId: string): Promise<void> {
        await this.post('compare', { playerId });
    }

    /**
     *  Talk to a given target (NPC or player).
     */
    public async talk(target: string): Promise<void> {
        await this.post('talk', { target });
    }

    /**
     *  Example for retrieving NPC art (if your server returns images).
     *  The server might return raw bytes or a base64 string.
     *  This implementation fetches a blob from the endpoint and returns a data URL.
     */
    public async getNpcArt(npcId: string): Promise<string | null> {
        const response = await this.post('npcArt', { npcId });
        if (!response.ok) {
            console.error('Failed to get NPC art:', response.status);
            return null;
        }
        const blob = await response.blob();
        // Convert Blob to a base64 data URL
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    resolve(null);
                }
            };
            reader.readAsDataURL(blob);
        });
    }

    /**
     *  Example: get server info from an endpoint
     *  (mirroring getClientConnectionInfo in Java).
     */
    public async getClientConnectionInfo(): Promise<any> {
        const response = await this.get('server_info');
        if (!response.ok) {
            console.error('Failed to get server info:', response.status);
            return null;
        }
        return response.json();
    }
}