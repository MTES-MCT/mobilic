import React from "react";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import makeStyles from "@material-ui/core/styles/makeStyles";
import DialogActions from "@material-ui/core/DialogActions";

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
    <DialogTitle disableTypography className={classes.container}>
      <Typography variant="h4">{title}</Typography>
      <IconButton
        aria-label="Fermer"
        onClick={handleClose}
        className={classes.button}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}

export function CustomDialogActions(props) {
  const classes = useStyles();
  return <DialogActions className={classes.actions} {...props} />;
}
