import Typography from "@material-ui/core/Typography";
import { formatPersonName } from "../utils/coworkers";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import React from "react";
import Box from "@material-ui/core/Box";
import { ModalContext } from "../utils/modals";
import { useApi } from "../utils/api";
import { useStoreSyncedWithLocalStorage } from "../utils/store";
import Divider from "@material-ui/core/Divider";
import useTheme from "@material-ui/core/styles/useTheme";

export function UserNameHeader({ withCompanyNameBelow = false }) {
  const theme = useTheme();
  const modals = React.useContext(ModalContext);
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  return (
    <Box
      className="header-container"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Box my={1} className="user-name-header">
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Typography noWrap variant="h6">
            {formatPersonName(storeSyncedWithLocalStorage.userInfo())}
          </Typography>
          <Box
            display={{
              xs: "none",
              sm: "none",
              md: "block",
              lg: "block",
              xl: "block"
            }}
          >
            <Typography style={{ marginLeft: "10vw" }} noWrap variant="h6">
              Entreprise : {storeSyncedWithLocalStorage.userInfo().companyName}
            </Typography>
          </Box>
        </Box>
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
      {withCompanyNameBelow && theme.breakpoints.down("md") && (
        <Box display={{ xs: "block", sm: "block", md: "none" }}>
          <Typography align="left">
            Entreprise : {storeSyncedWithLocalStorage.userInfo().companyName}
          </Typography>
        </Box>
      )}
      <Divider className="full-width-divider" />
    </Box>
  );
}
