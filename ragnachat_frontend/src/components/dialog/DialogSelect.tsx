import React, {ChangeEvent, useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Props {
    title: string;
    txt: string;
    label: string;
    open: boolean;
    acceptTxt?: string;
    cancelTxt?: string;
    onAccept?: (channel: string) => void;
    onCancel?: () => void;
}


export const DialogSelect: React.FC<Props> = (props) => {
    const {title, txt, label, open, acceptTxt, cancelTxt, onAccept, onCancel} = props;
    const [typedChannel, setTypedChannel] = useState("");

    const handleClose = (action: "ACCEPT" | "CANCEL") => () => {
        if (action === "ACCEPT" && onAccept) {
            onAccept(typedChannel);
        } else if (action === "CANCEL" && onCancel) {
            onCancel();
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => setTypedChannel(e.target.value);

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {txt}
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label={label}
                    type="text"
                    fullWidth
                    value={typedChannel}
                    onChange={onChange}
                />
            </DialogContent>
            <DialogActions>
                {acceptTxt && <Button onClick={handleClose("ACCEPT")} color="primary">
                    {acceptTxt}
                </Button>}
                {cancelTxt && <Button onClick={handleClose("CANCEL")} color="primary">
                    {cancelTxt}
                </Button>}
            </DialogActions>
        </Dialog>
    );
};
