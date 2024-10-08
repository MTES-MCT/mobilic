import React from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { formatGraphQLError } from "common/utils/errors";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useLoadingScreen } from "common/utils/loading";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { loadUserData } from "common/utils/loadUserData";
import { useSnackbarAlerts } from "../../common/Snackbar";
import Notice from "../../common/Notice";
import Modal from "../../common/Modal";

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

export default function ApiErrorDialogModal({
  open,
  handleClose,
  errors = [],
  title,
  shouldProposeRefresh = false
}) {
  const classes = useStyles();
  const withLoadingScreen = useLoadingScreen();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const displayTitle = title
    ? title
    : errors.some(e => e.hasRequestFailed)
    ? `❌ Erreur${errors.length > 1 ? "s" : ""} d'enregistrement`
    : `⚠️ Avertissement${errors.length > 1 ? "s" : ""}`;

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={displayTitle}
      content={
        <>
          {shouldProposeRefresh && (
            <Notice
              type="warning"
              description={
                <>
                  <Typography align={"justify"} className="bold">
                    Il est possible qu'un coéquipier ou un gestionnaire ait
                    apporté des nouveaux changements vous concernant. Vous
                    pouvez rafraîchir l'application pour les voir.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: 16 }}
                    onClick={() =>
                      withLoadingScreen(async () => {
                        await loadUserData(api, store, alerts);
                        handleClose();
                      })
                    }
                  >
                    Rafraîchir
                  </Button>
                </>
              }
            />
          )}
          {errors.map((error, index) => (
            <Box mt={2} key={index}>
              <Typography
                className={
                  error.hasRequestFailed
                    ? classes.failureStatusText
                    : classes.warningStatusText
                }
                align="justify"
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
                      <Typography align="justify">
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
        </>
      }
      actions={
        <Button color="primary" onClick={handleClose}>
          Fermer
        </Button>
      }
    />
  );
}
