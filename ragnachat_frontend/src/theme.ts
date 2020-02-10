import red from '@material-ui/core/colors/red';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
export const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#00695c',
            light: "#439889",
            dark: "#003d33",
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fff',
        },
    },
});
