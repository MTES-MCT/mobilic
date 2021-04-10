import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";

export default function CommentInputModal({
  open,
  handleClose,
  handleContinue
}) {
  const [text, setText] = React.useState("");

  React.useEffect(() => setText(""), [open]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <CustomDialogTitle
        title="Nouvelle observation"
        handleClose={handleClose}
      />
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
      <CustomDialogActions>
        <IconButton
          className="no-margin-no-padding"
          onClick={() => {
            handleContinue(text);
            handleClose();
          }}
          disabled={!text}
        >
          <CheckIcon color="primary" />
        </IconButton>
      </CustomDialogActions>
    </Dialog>
  );
}
