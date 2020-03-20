import {createStyles, Grid, Theme} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {addMessage} from "../redux/messageReducer";
import {useSelector} from "../redux/store";
import {useRagnaWebsocket} from "./useRagnaWebsocket";
import loginBackground from "./loginBackground.svg"
import Typography from "@material-ui/core/Typography";
import moment from "moment";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import {Send} from "@material-ui/icons";

const speechBubbleBase = (theme: Theme) => ({
    border: "1px solid #a7a7a7",
    borderRadius: "4px",
    boxShadow: "4px 4px 0 rgba(0, 0, 0, 0.2)",
    margin: `0px 0px ${theme.spacing(1)}px 0px`,
    width: "300px",
    padding: theme.spacing(1),
    position: "relative" as any,
    display: "flex" as any,
    flexDirection: "column" as any,
    backgroundColor: theme.palette.background.paper,
});

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
            overflow: "auto",
        },
        messageTyperContainer: {
            position: "absolute",
            bottom: theme.spacing(1),
            width: `calc(100% - ${theme.spacing(2)}px)`,
        },
        messageTyper: {
            margin: theme.spacing(1),
            width: "100%",
        },
        speechBubbleLeft: {
            ...speechBubbleBase(theme),
        },
        speechBubbleRight: {
            ...speechBubbleBase(theme),
            alignSelf: "flex-end",
        },
        avatar: {
            marginRight: theme.spacing(1),
        },
        avatarContainer: {
            marginBottom: theme.spacing(1),
        },
        button: {
            margin: `${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(1)}px 0px`,
        },
    }),
);

export const ChatBox: React.FC = () => {
    const classes = useStyles();
    const [typedMessage, setTypedMessage] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);

    const id = useSelector(state => state.auth.id);
    const messages = useSelector(state => state.message.messages);
    const dispatch = useDispatch();

    const containerDiv = useRef<HTMLDivElement>(null);

    const [sendMessage] = useRagnaWebsocket((msg) => {
        if (initialLoading) {
            setInitialLoading(false);
        }
        if (msg.id !== "RDY") {
            dispatch(addMessage(msg))
        }
    });

    useEffect(() => {
        if (containerDiv.current) {
            containerDiv.current.scrollTop = containerDiv.current.scrollHeight;
        }
    }, [messages]);

    const handleOnEnterPressed = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Enter") {
            return;
        }
        handleOnClick();
    };

    const handleOnClick = () => {
        sendMessage({cmd: "CREATE_MSG", channel: "main", content: typedMessage});
        setTypedMessage("")
    };

    return (
        <>
            {!initialLoading &&
            <Grid container direction="column" className={classes.container} justify="space-between">
                <Grid container direction="column" className={classes.chatContainer} wrap="nowrap" ref={containerDiv}>
                    {[...messages].reverse().map(msg => <div
                        key={msg.id}
                        className={id === msg.from.id ? classes.speechBubbleRight : classes.speechBubbleLeft}
                    >
                        <Grid container direction="column">
                            <Grid container direction="row" alignItems="center" className={classes.avatarContainer}>
                                {msg.from.pictureUrl &&
                                <Avatar className={classes.avatar} src={msg.from.pictureUrl}/>}
                                <Typography variant="body1">{msg.from.name}</Typography>
                            </Grid>
                            <Typography variant="body2">{msg.content}</Typography>
                            <Typography variant="caption" style={{alignSelf: "flex-end"}}>
                                {moment(msg.date).fromNow()}
                            </Typography>
                        </Grid>
                    </div>)}
                </Grid>
                <Paper className={classes.messageTyperContainer}>
                    <Grid container wrap="nowrap">
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
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={handleOnClick}
                            disabled={typedMessage === ""}
                        >
                            <Send/>
                        </Button>
                    </Grid>
                </Paper>
            </Grid>}
            {initialLoading && <Grid container alignItems="center" justify="center" className={classes.container}>
                <CircularProgress size={250}/>
            </Grid>}
        </>
    )
};
