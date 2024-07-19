import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

import Modal from "../../common/Modal";

export default function CommentInputModal({
  open,
  handleClose,
  handleContinue
}) {
  const [text, setText] = React.useState("");

  React.useEffect(() => setText(""), [open]);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Nouvelle observation"
      size="sm"
      content={
        <TextField
          fullWidth
          variant="standard"
          label="Message"
          multiline
          maxRows={10}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      }
      actions={
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
      }
    />
  );
}
