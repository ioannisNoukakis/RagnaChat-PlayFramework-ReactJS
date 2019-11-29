import {Message, MessageCreate} from "./model/Message";
import {WS_ENDPOINT} from "./urls";

export class RagnaWebsocket {
    /**
     * Websocket.
     */
    private ws: WebSocket | null = null;

    /**
     * Queue of unsent messages.
     */
    private queue: MessageCreate[] = [];

    /**
     * If true, the client is trying to reconnect to the server. After MAX_NUMBER_OF_RETRIES it gives up.
     */
    private reconnecting: boolean = false;

    /**
     * Number of failed reconnection attempts.
     */
    private numberOfRetries: number = 0;

    /**
     * Maximum time between connectivity checks in {infiniteRetry} mode. In milliseconds. Default to 5 minutes.
     */
    private readonly maxBackOffValue: number;

    /**
     * Interval for the reconnection strategy. The client will try to reconnect every x milliseconds (cf .RECONNECT_INTERVAL)
     */
    private reconnectIntervalId: any;

    private readonly evtOnConnected: (evt: Event) => void;
    private readonly evtOnClosed: (evt: Event) => void;
    private readonly evtOnError: (evt: Event) => void;
    private readonly evtOnMessage: (msg: Message) => void;

    constructor(maxBackOffValue: number,
                evtOnMessage: (msg: Message) => void,
                evtOnConnected: (evt: Event) => void,
                evtOnClosed: (evt: Event) => void,
                evtOnError: (evt: Event) => void) {
        this.maxBackOffValue = maxBackOffValue;
        this.evtOnMessage = evtOnMessage;
        this.evtOnConnected = evtOnConnected;
        this.evtOnClosed = evtOnClosed;
        this.evtOnError = evtOnError;
    }

    /**
     * Closes the connection with the server. Any messages unsent will be discarded.
     */
    close() {
        if (this.ws && !this.ws.CLOSING && !this.ws.CLOSED) {
            this.ws.close();
        }
        clearInterval(this.reconnectIntervalId);
        this.queue = [];
    }

    /**
     * Connects and attach the event listeners
     */
    private connect() {
        try {
            this.ws = new WebSocket(WS_ENDPOINT);
            this.ws.onmessage = this.onMessage;
            this.ws.onopen = this.onOpen;
            this.ws.onclose = this.onClose;
            this.ws.onerror = this.onError;
        } catch (_) {
            this.reconnect();
        }
        if (this.ws && this.ws.readyState === WebSocket.CLOSED || this.ws && this.ws.readyState === WebSocket.CLOSING) {
            this.reconnect();
        }
    }

    /**
     * Fires upon successful WebSocket connection.
     * @param {Event} e: The event from the original emitter.
     */
    private onOpen = (e: Event) => {
        this.reconnecting = false;
        this.numberOfRetries = 0;
        clearInterval(this.reconnectIntervalId);
        while (this.ws && this.queue.length > 0 && this.ws.readyState === this.ws.OPEN) {
            this.sendMessage(this.queue.pop()!);
        }
        this.evtOnConnected(e);
    };

    /**
     * Fires upon disconnection from the server.
     * @param {Event} e: The event from the original emitter.
     */
    private onClose = (e: Event & { code: number }) => {
        if (!wasWsclosedNormally(e.code)) {
            this.reconnect();
        }
        this.evtOnClosed(e);
    };

    /**
     * Fires upon WebSocket error.
     * @param {Event} e: The event from the original emitter.
     */
    private onError = (e: Event) => {
        // if there is an error and the readyState is at 3 that means the ws couldn't connect to the server.
        // @ts-ignore
        if (e.target && e.target.readyState === WebSocket.CLOSED) {
            console.error(e);
        } else {
            this.reconnect();
        }
        this.evtOnError(e);
    };

    /**
     * Sends a message through the websocket with queue management if the websocket is unavailable. Uses a weborker
     * if this api is available.
     * @param {Message} msg - The message to be send.
     * @param {boolean} transient - if the message should be dropped and not queued.
     */
    public sendMessage(msg: MessageCreate, transient: boolean = false) {
        if (this.ws && this.ws.readyState !== this.ws.OPEN) {
            if (!this.reconnecting) {
                this.reconnecting = true;
                this.reconnect();
            }
            if (!transient) {
                this.queue.push(msg);
            }
        } else {
            const toSend = JSON.stringify(msg);
            this.ws!.send(toSend);
        }
    }

    /**
     * Will try to reconnect indefinitely.
     */
    private reconnect() {
        const timeToWait = expBackOffGenerator(this.numberOfRetries, this.maxBackOffValue);
        if (timeToWait < this.maxBackOffValue) {
            this.numberOfRetries++;
        }
        setTimeout(
            () => this.connect(),
            timeToWait
        );
    }


    private onMessage = (ev: MessageEvent) => {
        console.log("Socket message:", ev.data);
        this.evtOnMessage(JSON.parse(ev.data));
    };
}

/**
 * Defined by https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 */
const WS_NORMAL_STATUS_CODES = [1000, 1006];

/**
 * Returns true when a WebSocket close code is in the WS_NORMAL_STATUS_CODES.
 * @param code: The close code of the WebSocket.
 */
export const wasWsclosedNormally = (code: number) => WS_NORMAL_STATUS_CODES.indexOf(code) !== -1;

/**
 * Uses a exponential back-off algorithm and randomness to generate the next time to wait (in milliseconds)
 * before re-trying an connection.
 *
 * The idea of this algorithm is to wait each time exponentially longer in order to avoid all clients to
 * spam a resource every 0.5 second.
 *
 * @param numberOfAttempts: the number of already made attempts.
 * @param maxBackoffValue: The maximum time a client can wait
 */
export const expBackOffGenerator = (numberOfAttempts: number, maxBackoffValue: number): number => {
    const step = Math.pow(2, numberOfAttempts);
    const max = step + step / 3;
    const min = step - step / 3;
    return Math.min((Math.random() * (max - min + 1) + min) * 1000, maxBackoffValue);
};
