import React from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogTitle from "@mui/material/DialogTitle";
import { makeStyles } from "@mui/styles";
import DialogActions from "@mui/material/DialogActions";

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  button: {
    paddingBottom: 0,
    paddingTop: 2,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: theme.spacing(4)
  },
  actions: {
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

export function CustomDialogTitle({ handleClose, title }) {
  const classes = useStyles();
  return (
    <DialogTitle className={classes.container}>
      <Typography variant="h4" component="span">
        {title}
      </Typography>
      {handleClose && (
        <IconButton
          aria-label="Fermer"
          onClick={handleClose}
          className={classes.button}
        >
          <CloseIcon />
        </IconButton>
      )}
    </DialogTitle>
  );
}

export function CustomDialogActions(props) {
  const classes = useStyles();
  return <DialogActions className={classes.actions} {...props} />;
}
