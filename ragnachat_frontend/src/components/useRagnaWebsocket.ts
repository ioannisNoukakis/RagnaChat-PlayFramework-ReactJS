import {useCallback, useEffect, useRef} from "react";
import {RagnaWebsocket} from "../api/RagnaWebsocket";
import {Message, MessageCreate} from "../api/model/Message";

export const useRagnaWebsocket = (messageHandler: (msg: Message) => void) => {
    const ragnachatWebSocket = useRef<RagnaWebsocket>(null);

    const sendMessage = useCallback((message: MessageCreate) => {
        ragnachatWebSocket.current && ragnachatWebSocket.current.sendMessage(message);
    }, []);

    useEffect(() => {
        // @ts-ignore
        ragnachatWebSocket.current = new RagnaWebsocket(5000, messageHandler);
        ragnachatWebSocket.current!.sendMessage({cmd: "LAST_X_MSG", nMessages: 50});
        // return ragnachatWebSocket.current ? ragnachatWebSocket.current.close() : () => {}
    }, []);

    return [sendMessage];
};
