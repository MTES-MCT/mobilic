import React from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@codegouvfr/react-dsfr/Button";

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
        <>
          <Button
            onClick={() => {
              handleContinue(text);
              handleClose();
            }}
            disabled={!text}
          >
            Valider
          </Button>
        </>
      }
    />
  );
}
