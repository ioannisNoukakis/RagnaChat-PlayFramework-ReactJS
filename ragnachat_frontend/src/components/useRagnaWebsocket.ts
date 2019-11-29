import {useCallback, useEffect, useRef} from "react";
import {RagnaWebsocket} from "../api/RagnaWebsocket";
import {MessageCreate} from "../api/model/Message";

export const useRagnaWebsocket = (messageHandler: (msg: string) => void) => {
    const QimWebsocketRef = useRef<RagnaWebsocket>(null);

    const sendMessage = useCallback((message: MessageCreate) => {
        QimWebsocketRef.current && QimWebsocketRef.current.sendMessage(message);
    }, []);

    useEffect(() => {
        // @ts-ignore
        QimWebsocketRef.current = new RagnaWebsocket(messageHandler);
        // return QimWebsocketRef.current ? QimWebsocketRef.current.close() : () => {}
    }, []);

    return [sendMessage];
};
