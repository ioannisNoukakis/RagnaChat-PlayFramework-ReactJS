import {createStyles, Grid, Theme} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import * as React from "react";
import {useState} from "react";
import GoogleLogin, {GoogleLoginResponse, GoogleLoginResponseOffline} from "react-google-login";
import {useDispatch} from "react-redux";
import {auth} from "../api/action";
import {setAuthStatus} from "../redux/authReducer";
import {ErrorMsg} from "./dialog/ErrorMsg";
import loginBackground from "./loginBackground.svg";
import play_framework_logo from "./technos/play_framework_logo.png";
import react_js_logo from "./technos/react_js_logo.png";
import mongodb_logo from "./technos/mongodb_logo.png";
import typescript_logo from "./technos/typescript_logo.png";
import Typography from "@material-ui/core/Typography";

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
        intoContainer: {
            maxWidth: "800px",
        },
        paper: {
            width: `calc(100vw-${theme.spacing(4)})`,
            padding: theme.spacing(4),
            [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(1),
            },
        },
        technoContainer: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            [theme.breakpoints.down('sm')]: {
                flexDirection: "column",
            },
        },
        separator: {
            height: theme.spacing(2),
        },
        separatorV: {
            width: theme.spacing(2),
        },
        techno: {
            width: 200,
            height: "100%",
            margin: theme.spacing(2),
        },
        technoSquare: {
            width: 100,
            height: "100%",
            margin: theme.spacing(2),
        }
    }),
);

export const LoginOrCreateForm: React.FC = () => {
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const dispatch = useDispatch();
    const classes = useStyles();

    // Send to backend id_token via HTTPS and then backend verifies this token.
    const onGoogleAuthSuccess = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        const id = await auth({idTokenString: (response as GoogleLoginResponse).getAuthResponse().id_token});
        console.log("SUCCESS", id);
        if (id === null) {
            setErrorMsg("Something wrong happened and we could not process your request. Please try again later.");
            setErrorOpen(true);
            console.error("Authentication failed!");
            return;
        }
        dispatch(setAuthStatus(id))
    };

    const onGoogleAuthFailure = () => {
        setErrorMsg("Failed to auth trough Google.");
        setErrorOpen(true);
        console.error("Authentication failed!");
    };

    return (
        <Grid container alignItems="center" justify="center" className={classes.container}>
            <ErrorMsg errorMsg={errorMsg} onClose={() => setErrorOpen(false)} open={errorOpen}/>
            <div className={classes.bg_image}/>
            <Paper className={classes.paper}>
                <Grid container alignItems="center" justify="center" direction="column">
                    <Typography variant="h3" align="center">
                        <span role="img" aria-label="fire">🔥</span> Ragna Chat <span role="img"
                                                                                      aria-label="fire">🔥</span>
                    </Typography>
                    <div className={classes.separator}/>
                    <Typography variant="body1" align="center" className={classes.intoContainer}>
                        Ragna Chat is a small live chat prototype built upon Scala Play and
                        ReactJS. It uses the reactive change streams of MongoDB to coordinate messages across
                        multiple nodes.
                    </Typography>
                    <div className={classes.separator}/>
                    <Grid container alignItems="center" justify="center" direction="row">
                        <Typography>
                            Feel free to try it:
                        </Typography>
                        <div className={classes.separatorV}/>
                        <GoogleLogin
                            clientId="610738244367-bn15rn9t1di41qm6g551dtasm4km9233.apps.googleusercontent.com"
                            buttonText="Login/create"
                            onSuccess={onGoogleAuthSuccess}
                            onFailure={onGoogleAuthFailure}
                            cookiePolicy={'single_host_origin'}
                        />
                    </Grid>
                    <div className={classes.separator}/>
                    <Typography variant="caption">
                        This service stores in its db the following information from your google account:
                        <ul>
                            <li>Google id</li>
                            <li>name</li>
                            <li>pictureUrl</li>
                        </ul>
                    </Typography>
                    <div className={classes.technoContainer}>
                        <img src={play_framework_logo} className={classes.techno} alt="play_framework_logo"/>
                        <img src={mongodb_logo} className={classes.techno} alt="mongodb_logo"/>
                        <img src={react_js_logo} className={classes.technoSquare} alt="react_js_logo"/>
                        <img src={typescript_logo} className={classes.technoSquare} alt="typescript_logo"/>
                    </div>
                    <div className={classes.separator}/>
                    <a href="https://github.com/ioannisNoukakis/RagnaChat-PlayFramework-ReactJS">https://github.com/ioannisNoukakis/RagnaChat-PlayFramework-ReactJS</a>
                </Grid>
            </Paper>
        </Grid>
    )
};
