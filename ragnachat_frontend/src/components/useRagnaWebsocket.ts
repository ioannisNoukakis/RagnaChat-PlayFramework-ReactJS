import {useCallback, useEffect, useRef} from "react";
import {RagnaWebsocket} from "../api/RagnaWebsocket";
import {MessageCreate} from "../api/model/Message";

export const useRagnaWebsocket = (messageHandler: (msg: string) => void) => {
    const ragnachatWebSocket = useRef<RagnaWebsocket>(null);

    const sendMessage = useCallback((message: MessageCreate) => {
        ragnachatWebSocket.current && ragnachatWebSocket.current.sendMessage(message);
    }, []);

    useEffect(() => {
        // @ts-ignore
        ragnachatWebSocket.current = new RagnaWebsocket(messageHandler);
        ragnachatWebSocket.current!.sendMessage({cmd: "LAST_50_MSG"})
        // return QimWebsocketRef.current ? QimWebsocketRef.current.close() : () => {}
    }, []);

    return [sendMessage];
};
