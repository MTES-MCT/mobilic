import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";

export function CommentInputModal({ open, handleClose, handleContinue }) {
  const [text, setText] = React.useState("");

  React.useEffect(() => setText(""), [open]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Nouveau commentaire</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Message"
          multiline
          rowsMax="10"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleClose}>
          <CloseIcon color="error" />
        </IconButton>
        <IconButton
          onClick={() => {
            handleContinue(text);
            handleClose();
          }}
        >
          <CheckIcon color="primary" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
