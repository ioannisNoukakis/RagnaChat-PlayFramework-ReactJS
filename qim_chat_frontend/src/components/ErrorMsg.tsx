import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import * as React from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        snackbar: {
            backgroundColor: theme.palette.error.dark,
        },
        close: {
            padding: theme.spacing(0.5),
        },
    }),
);

interface Props {
    errorMsg: string;
    open: boolean;
    onClose: () => void;
}

export const ErrorMsg: React.FC<Props> = (props) => {
    const classes = useStyles();

    const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        props.onClose();
    };

    return (
        <Snackbar
            className={classes.snackbar}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={props.open}
            autoHideDuration={3000}
            onClose={handleClose}
        >
            <SnackbarContent
                className={classes.snackbar}
                message={<span>{props.errorMsg}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="close"
                        color="inherit"
                        className={classes.close}
                        onClick={handleClose}
                    >
                        <CloseIcon/>
                    </IconButton>,
                ]}
            />
        </Snackbar>
    );
};
