import {Message, MessageCreate} from "./model/Message";
import {WS_ENDPOINT} from "./urls";

export class RagnaWebsocket {
    private readonly socket: WebSocket;
    private readonly messageHandler: (msg: string) => void;

    constructor(messageHandler: (msg: string) => void) {
        this.socket = new WebSocket(WS_ENDPOINT);
        this.socket.onopen = this.onOpen;
        this.socket.onclose = this.onClose;
        this.socket.onerror = this.onError;
        this.socket.onmessage = this.onMessage;
        this.messageHandler = messageHandler;
    }

    send = (msg: MessageCreate) => {
        if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
            console.error("Cannot send message because the connection with the server is not open!");
            return;
        }
        this.socket.send(JSON.stringify(msg));
    };

    close() {
        if (this.socket) {
            this.socket.close();
        }
    }

    private onOpen = (ev: Event) => console.log("Socket has opened successfully", ev);

    private onClose = (ev: CloseEvent) => console.log("Socket has been closed", ev.reason);

    private onError = (ev: Event) => console.error("Socket error!", ev);

    private onMessage = (ev: MessageEvent) => {
        console.log("Socket message:", ev.data);
        this.messageHandler(ev.data);
    };
}
