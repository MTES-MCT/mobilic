import Typography from "@material-ui/core/Typography";
import { formatPersonName } from "../utils/coworkers";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import React from "react";
import Box from "@material-ui/core/Box";
import { ModalContext } from "../utils/modals";
import { useApi } from "../utils/api";
import { useStoreSyncedWithLocalStorage } from "../utils/store";
import { Header } from "./Header";
import { Logos } from "./Logos";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";

function AppUserHeader({ withCompanyNameBelow }) {
  const modals = React.useContext(ModalContext);
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  return (
    <Box>
      <Box className="flexbox-space-between">
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Typography noWrap variant="body1">
            {formatPersonName(storeSyncedWithLocalStorage.userInfo())}
          </Typography>
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
      {withCompanyNameBelow && (
        <Box mt={1} display={{ xs: "block", sm: "block", md: "none" }}>
          <Typography align="left">
            Entreprise : {storeSyncedWithLocalStorage.userInfo().companyName}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function DesktopUserHeader() {
  const modals = React.useContext(ModalContext);
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  return (
    <Box className="flexbox-space-between">
      <Logos />
      <Box style={{ display: "flex", alignItems: "center" }}>
        <Box mr={10}>
          <Typography noWrap variant="body1">
            {formatPersonName(storeSyncedWithLocalStorage.userInfo())} -{" "}
            {storeSyncedWithLocalStorage.userInfo().companyName}
          </Typography>
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
    </Box>
  );
}

function _UserHeader({ withCompanyNameBelow = false, width }) {
  return (
    <Header>
      {isWidthUp("md", width) ? (
        <DesktopUserHeader />
      ) : (
        <AppUserHeader withCompanyNameBelow={withCompanyNameBelow} />
      )}
    </Header>
  );
}

export const UserHeader = withWidth()(_UserHeader);
