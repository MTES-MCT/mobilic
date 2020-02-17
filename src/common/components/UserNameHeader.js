import Typography from "@material-ui/core/Typography";
import { formatPersonName } from "../utils/coworkers";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import React from "react";
import Box from "@material-ui/core/Box";
import { ModalContext } from "../utils/modals";
import { useApi } from "../utils/api";
import { useStoreSyncedWithLocalStorage } from "../utils/store";

export function UserNameHeader() {
  const modals = React.useContext(ModalContext);
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  return (
    <Box className="user-name-header">
      <Typography noWrap variant="h6">
        {formatPersonName(storeSyncedWithLocalStorage.userInfo())}
      </Typography>
      <IconButton
        color="primary"
        onClick={() =>
          modals.open("confirmation", {
            handleConfirm: () => api.logout(),
            title: "Confirmer déconnexion"
          })
        }
      >
        <ExitToAppIcon />
      </IconButton>
    </Box>
  );
}
