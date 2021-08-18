import React from "react";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import TextField from "@material-ui/core/TextField/TextField";

export default function BatchInvite({ open, handleClose, handleSubmit }) {
  const [text, setText] = React.useState("");
  const [tooManyLinesError, setTooManyLinesError] = React.useState(false);

  function parseText(t) {
    return t
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  React.useEffect(() => {
    if (parseText(text).length > 100) setTooManyLinesError(true);
    else setTooManyLinesError(false);
  }, [text]);

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md">
      <CustomDialogTitle
        title="Inviter une liste d'emails"
        handleClose={handleClose}
      />
      <DialogContent>
        <Typography gutterBottom>
          Vous pouvez inviter d'un coup plusieurs salariés en copiant ci-dessous
          leurs adresses mail. Chaque adresse doit figurer sur une nouvelle
          ligne.
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Adresses email"
          placeholder={`martin.dupond@gmail.com\ncorinne.robert@outlook.fr\n...`}
          multiline
          rows={10}
          rowsMax={20}
          value={text}
          error={tooManyLinesError}
          helperText={
            tooManyLinesError
              ? "Le nombre d'emails ne peut pas dépasser 100. Vous pouvez découper la liste et le faire en plusieurs fois"
              : ""
          }
          onChange={e => setText(e.target.value)}
        />
      </DialogContent>
      <CustomDialogActions>
        <LoadingButton
          color="primary"
          variant="contained"
          disabled={!text || tooManyLinesError}
          onClick={async e => {
            await handleSubmit(parseText(text));
            handleClose();
          }}
        >
          Inviter
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
