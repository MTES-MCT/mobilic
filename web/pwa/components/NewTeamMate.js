import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  lastNameField: {
    marginTop: theme.spacing(2)
  }
}));

export default function NewTeamMateModal({ open, handleClose, handleSubmit }) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const classes = useStyles();

  React.useEffect(() => {
    setFirstName("");
    setLastName("");
  }, [open]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>
        <Typography variant="h4" component="span">
          Nouveau coéquipier
        </Typography>
      </DialogTitle>
      <form
        noValidate
        autoComplete="off"
        onSubmit={async e => {
          e.preventDefault();
          handleSubmit(firstName, lastName);
          handleClose();
        }}
      >
        <DialogContent>
          <TextField
            fullWidth
            variant="filled"
            label="Prénom"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <TextField
            className={classes.lastNameField}
            fullWidth
            variant="filled"
            label="Nom"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <IconButton onClick={handleClose}>
            <CloseIcon color="error" />
          </IconButton>
          <IconButton type="submit" disabled={!firstName || !lastName}>
            <CheckIcon color="primary" />
          </IconButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
