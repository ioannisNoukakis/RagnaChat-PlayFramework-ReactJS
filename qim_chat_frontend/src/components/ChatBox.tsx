import {Grid} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import * as React from "react";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Message} from "../api/model/Message";
import {QimWebsocket} from "../api/QimWebsocket";
import {addMessage} from "../redux/messageReducer";
import {useSelector} from "../redux/store";

export const ChatBox: React.FC = () => {
    const [typedMessage, setTypedMessage] = useState("");

    const id = useSelector(state => state.auth.id);
    const messages = useSelector(state => state.message.messages);
    const dispatch = useDispatch();

    useEffect(() => {
        const qimWebsocket = new QimWebsocket((msg) =>  dispatch(addMessage(msg)));
        return () => qimWebsocket.close()
    }, []);

    return (
        <Grid container alignItems="center" justify="center" direction="column">
            {messages.map(msg => <div
                style={id === msg.from.id ? {backgroundColor: "green"} : undefined}
                key={msg.id}
            >
                {msg.date}/{msg.content}
            </div>)}
            <TextField
                multiline
                fullWidth
                id="login-username-required"
                label="Send text"
                margin="normal"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" ? }
            />
        </Grid>
    )
};
