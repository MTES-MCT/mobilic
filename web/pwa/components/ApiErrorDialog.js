import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { formatGraphQLError } from "common/utils/errors";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  statusText: {
    color: hasRequestFailed =>
      hasRequestFailed ? theme.palette.error.main : theme.palette.warning.main
  },
  errorList: {
    listStyle: "circle",
    marginLeft: "40px"
  }
}));

export function ApiErrorDialogModal({
  open,
  hasRequestFailed,
  handleClose,
  actionDescription,
  errors = []
}) {
  const store = useStoreSyncedWithLocalStorage();
  const userId = store.userId();
  const classes = useStyles(hasRequestFailed);
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle disableTypography>
        <Typography variant="h4">
          {hasRequestFailed ? "❌ Erreur d'enregistrement" : "⚠️ Avertissement"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography className={classes.statusText}>
          {actionDescription}{" "}
          {hasRequestFailed
            ? "n'a pas pu être enregistré pour les raisons suivantes :"
            : "a bien été enregistré, mais avec les réserves suivantes : "}
        </Typography>
        <List className={classes.errorList}>
          {errors.map((error, index) => (
            <ListItem
              disableGutters
              style={{ display: "list-item" }}
              key={index}
            >
              <Typography>{formatGraphQLError(error, userId)}</Typography>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
