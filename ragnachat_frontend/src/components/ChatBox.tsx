import {createStyles, Grid, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import * as React from "react";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {addMessage, setChannel} from "../redux/messageReducer";
import {useSelector} from "../redux/store";
import {useRagnaWebsocket} from "./useRagnaWebsocket";
import {DialogSelect} from "./dialog/DialogSelect";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            height: "100vh",
        },
        chatContainer: {
            height: "calc(100vh - 72px)",
        }
    }),
);

export const ChatBox: React.FC = () => {
    const classes = useStyles();
    const [typedMessage, setTypedMessage] = useState("");

    const id = useSelector(state => state.auth.id);
    const messages = useSelector(state => state.message.messages);
    const channel = useSelector(state => state.message.channel);
    const dispatch = useDispatch();

    const onChannelSelect = (channel: string) => {
        console.log("AH", channel);
        dispatch(setChannel(channel));
    };

    const [sendMessage] = useRagnaWebsocket((msg) => dispatch(addMessage(JSON.parse(msg))));

    const handleOnEnterPressed = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Enter" || channel === null) {
            return;
        }
        sendMessage({channel, content: typedMessage});
        setTypedMessage("")
    };

    return (
        <>
            <DialogSelect
                open={channel === null || channel === ""}
                title="Select your channel"
                txt="It can have any name (just not blank)."
                label="Channel name"
                acceptTxt="Select"
                onAccept={onChannelSelect}
            />
            <Grid container direction="column" className={classes.container}>
                <Grid container direction="column" className={classes.chatContainer}>
                    {[...messages].reverse().map(msg => <div
                        style={id === msg.from.id ? {backgroundColor: "green"} : undefined}
                        key={msg.id}
                    >
                        [{msg.from.username}] - {new Date(msg.date).toISOString()} - {msg.content}
                    </div>)}
                </Grid>
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
        </>
    )
};
