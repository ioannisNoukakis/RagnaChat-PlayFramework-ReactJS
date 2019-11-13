import {Grid} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {useState} from "react";
import * as React from "react";
import {useDispatch} from "react-redux";
import {auth, createUser} from "../api/action";
import {UserAuth} from "../api/model/User";
import {setAuthStatus} from "../redux/authReducer";

export const LoginOrCreateForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const onClick = (fn: (user: UserAuth) => Promise<String | null>) => async () => {
        if (username === "" || password === "") {
            console.error("Username and password cannot be empty.");
            return;
        }
        const id = await fn({username, password});
        if (id === null) {
            console.error("Authentication failed!");
            return;
        }
        dispatch(setAuthStatus(id))
    };

    return (
        <Grid container alignItems="center" justify="center" direction="column">
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
            <Grid container alignItems="center" justify="center">
                <Button variant="contained" color="primary" onClick={onClick(auth)}>
                    Login
                </Button>
                <Button variant="contained" color="secondary" onClick={onClick(createUser)}>
                    Create an account
                </Button>
            </Grid>
        </Grid>
    )
};
