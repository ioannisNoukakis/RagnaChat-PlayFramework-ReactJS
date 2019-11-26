import {createStyles, Grid, Theme} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import {useState} from "react";
import * as React from "react";
import {useDispatch} from "react-redux";
import {auth, createUser} from "../api/action";
import {UserAuth} from "../api/model/User";
import {setAuthStatus} from "../redux/authReducer";
import {ErrorMsg} from "./dialog/ErrorMsg";
import loginBackground from "./loginBackground.svg"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            height: "100vh",
        },
        bg_image: {
            backgroundImage: `url(${loginBackground})`,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -10,
        },
        paper: {
            padding: theme.spacing(4),
            width: 350
        },
        separator: {
            height: theme.spacing(2),
        }
    }),
);

const LOGIN_MODE = "LOGIN_MODE";
const CREATE_USER_MODE = "CREATE_USER_MODE";

export const LoginOrCreateForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [mode, setMode] = useState<typeof LOGIN_MODE | typeof CREATE_USER_MODE>(LOGIN_MODE);
    const dispatch = useDispatch();
    const classes = useStyles();

    const onClick = (mode: typeof LOGIN_MODE | typeof CREATE_USER_MODE) => async () => {
        if (username === "" || password === "") {
            console.error("Username and password cannot be empty.");
            return;
        }
        const fn = mode === LOGIN_MODE ? auth : createUser;
        const id = await fn({username, password});
        if (id === null) {
            setErrorMsg(mode === LOGIN_MODE ? "Invalid credentials." : "This account already exits");
            setErrorOpen(true);
            console.error("Authentication failed!");
            return;
        }
        dispatch(setAuthStatus(id))
    };

    return (
        <Grid container alignItems="center" justify="center" className={classes.container}>
            <ErrorMsg errorMsg={errorMsg} onClose={() => setErrorOpen(false)} open={errorOpen}/>
            <div className={classes.bg_image}/>
            <Paper className={classes.paper}>
                <Grid container alignItems="center" justify="center" direction="column">
                    <Typography variant="h4">{mode === LOGIN_MODE ? "Sign In" : "Sign Up"}</Typography>
                    <TextField
                        required
                        id="login-username-required"
                        label="Username"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        required
                        id="login-password-required"
                        label="Password"
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className={classes.separator}/>
                    <Button variant="contained" color="primary" onClick={onClick(mode)}>
                        {mode === LOGIN_MODE ? "Login" : "Create account"}
                    </Button>
                    <div className={classes.separator}/>
                    <Typography>
                        <a href="" onClick={(e) => {
                            e.preventDefault();
                            if (mode === LOGIN_MODE) {
                                setMode(CREATE_USER_MODE);
                            } else {
                                setMode(LOGIN_MODE);
                            }
                        }}>
                            {mode === LOGIN_MODE ? "Don't have an account? Sign up!" : "Already have an account? Sign in!"}
                        </a>
                    </Typography>
                </Grid>
            </Paper>
        </Grid>
    )
};
