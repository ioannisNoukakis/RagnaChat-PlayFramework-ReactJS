import {useCallback, useEffect, useRef} from "react";
import {QimWebsocket} from "../api/QimWebsocket";
import {Message, MessageCreate} from "../api/model/Message";

export const useQimWebsocket = (messageHandler: (msg: string) => void) => {
    const QimWebsocketRef = useRef<QimWebsocket>(null);

    const sendMessage = useCallback((message: MessageCreate) => {
        QimWebsocketRef.current && QimWebsocketRef.current.send(message);
    }, []);

    useEffect(() => {
        // @ts-ignore
        QimWebsocketRef.current = new QimWebsocket(messageHandler);
        return QimWebsocketRef.current.close;
    }, []);

    return [sendMessage];
};