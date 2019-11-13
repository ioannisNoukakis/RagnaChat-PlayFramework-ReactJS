import {Grid} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import * as React from "react";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {addMessage} from "../redux/messageReducer";
import {useSelector} from "../redux/store";
import {useQimWebsocket} from "./useQimWebsocket";

export const ChatBox: React.FC = () => {
    const [typedMessage, setTypedMessage] = useState("");

    const id = useSelector(state => state.auth.id);
    const messages = useSelector(state => state.message.messages);
    const dispatch = useDispatch();

    const [sendMessage] = useQimWebsocket((msg) => dispatch(addMessage(JSON.parse(msg))));

    const handleOnEnterPressed = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Enter") {
            return;
        }
        sendMessage({content: typedMessage})
        setTypedMessage("")
    };

    return (
        <Grid container justify="center" direction="column">
            {[...messages].reverse().map(msg => <div
                style={id === msg.from.id ? {backgroundColor: "green"} : undefined}
                key={msg.id}
            >
                [{msg.from.username}] - {new Date(msg.date).toISOString()} - {msg.content}
            </div>)}
            <TextField
                fullWidth
                id="login-username-required"
                label="Send text"
                margin="normal"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyPress={handleOnEnterPressed}
            />
        </Grid>
    )
};
