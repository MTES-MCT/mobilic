import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
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
          variant="standard"
          label="Message"
          multiline
          maxRows={10}
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
