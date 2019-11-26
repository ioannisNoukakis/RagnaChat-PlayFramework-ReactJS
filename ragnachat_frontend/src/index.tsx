import {CssBaseline} from "@material-ui/core";
import {ThemeProvider} from '@material-ui/core/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {checkAuth} from "./api/action";
import App from './components/App';
import {setAuthStatus} from "./redux/authReducer";
import {store} from "./redux/store";
import * as serviceWorker from './serviceWorker';
import {theme} from "./theme";

(async () => {
    const authResult = await checkAuth();

    console.log("AH");
    store.dispatch(setAuthStatus(authResult));
    ReactDOM.render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline/>
                <App/>
            </ThemeProvider>
        </Provider>, document.getElementById('root'));

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister();
})();
