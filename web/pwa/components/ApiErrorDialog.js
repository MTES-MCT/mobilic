import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { formatGraphQLError } from "common/utils/errors";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
  failureStatusText: {
    color: theme.palette.error.main
  },
  warningStatusText: {
    color: theme.palette.warning.main
  },
  errorList: {
    listStyle: "circle",
    marginLeft: "40px"
  }
}));

export function ApiErrorDialogModal({ open, handleClose, errors = [], title }) {
  const classes = useStyles();

  const displayTitle = title
    ? title
    : errors.some(e => e.hasRequestFailed)
    ? `❌ Erreur${errors.length > 1 ? "s" : ""} d'enregistrement`
    : `⚠️ Avertissement${errors.length > 1 ? "s" : ""}`;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle disableTypography>
        <Typography variant="h4">{displayTitle}</Typography>
      </DialogTitle>
      <DialogContent>
        {errors.map((error, index) => (
          <Box mt={2} key={index}>
            <Typography
              className={
                error.hasRequestFailed
                  ? classes.failureStatusText
                  : classes.warningStatusText
              }
            >
              {error.message
                ? error.message
                : `${error.actionDescription} ${
                    error.hasRequestFailed
                      ? `n'a pas pu être enregistré${
                          error.isActionDescriptionFemale ? "e" : ""
                        } pour les raisons suivantes :`
                      : `a bien été enregistré${
                          error.isActionDescriptionFemale ? "e" : ""
                        }, mais avec les réserves suivantes : `
                  }`}
            </Typography>
            {error.graphQLErrors && (
              <List className={classes.errorList}>
                {error.graphQLErrors.map((graphQLError, index) => (
                  <ListItem
                    disableGutters
                    style={{ display: "list-item" }}
                    key={index}
                  >
                    <Typography>
                      {formatGraphQLError(
                        graphQLError,
                        error.overrideFormatGraphQLError
                      )}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
