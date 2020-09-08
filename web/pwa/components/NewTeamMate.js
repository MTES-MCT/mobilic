import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  lastNameField: {
    marginTop: theme.spacing(2)
  }
}));

export function NewTeamMateModal({ open, handleClose, handleSubmit }) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const classes = useStyles();

  React.useEffect(() => {
    setFirstName("");
    setLastName("");
  }, [open]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle disableTypography>
        <Typography variant="h4">Nouveau coéquipier</Typography>
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
