import red from '@material-ui/core/colors/red';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
export const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#f44332',
            light: "#ff795d",
            dark: "#b90007",
        },
        secondary: {
            main: '#ffa000',
            light: "#ffd149",
            dark: "#c67100",
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fff',
        },
    },
});
