import {createStyles, Grid, Theme} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import * as React from "react";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {addMessage} from "../redux/messageReducer";
import {useSelector} from "../redux/store";
import {useRagnaWebsocket} from "./useRagnaWebsocket";
import loginBackground from "./loginBackground.svg"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            height: "100vh",
            padding: theme.spacing(1),
            backgroundImage: `url(${loginBackground})`,
        },
        chatContainer: {
            padding: theme.spacing(1),
            height: `calc(100vh - ${theme.spacing(10)}px)`,
            overflow: "scroll",
        },
        messageTyperContainer: {
            position: "absolute",
            bottom: 0,
        },
        messageTyper: {
            margin: theme.spacing(1),
            width: `calc(100vw - ${theme.spacing(4)}px)`,
        }
    }),
);

export const ChatBox: React.FC = () => {
    const classes = useStyles();
    const [typedMessage, setTypedMessage] = useState("");

    const id = useSelector(state => state.auth.id);
    const messages = useSelector(state => state.message.messages);
    const dispatch = useDispatch();

    const [sendMessage] = useRagnaWebsocket((msg) => dispatch(addMessage(JSON.parse(msg))));

    const handleOnEnterPressed = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Enter") {
            return;
        }
        sendMessage({channel: "main", content: typedMessage});
        setTypedMessage("")
    };

    return (
        <>
            <Grid container direction="column" className={classes.container} justify="space-between">
                <Grid container direction="column" className={classes.chatContainer} wrap="nowrap">
                    {[...messages].reverse().map(msg => <div
                        style={id === msg.from.id ? {backgroundColor: "green"} : undefined}
                        key={msg.id}
                    >
                        [{msg.from.username}] - {new Date(msg.date).toISOString()} - {msg.content}
                    </div>)}
                </Grid>
                <Paper className={classes.messageTyperContainer}>
                    <TextField
                        id="login-username-required"
                        label="Send text"
                        margin="none"
                        variant="outlined"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        onKeyPress={handleOnEnterPressed}
                        className={classes.messageTyper}
                    />
                </Paper>
            </Grid>
        </>
    )
};
