import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/core/SvgIcon/SvgIcon";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";
import { useApi } from "../common/utils/api";
import Button from "@material-ui/core/Button";
import { ModalContext } from "../app/utils/modals";
import { loadUserData } from "../common/utils/loadUserData";

export function Admin() {
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const modals = React.useContext(ModalContext);

  React.useEffect(() => {
    loadUserData(api, storeSyncedWithLocalStorage);
    return () => {};
  }, []);

  return (
    <Container>
      <div className="user-name-header">
        <Typography noWrap variant="h6">
          {storeSyncedWithLocalStorage.getFullName()}
        </Typography>
        <Typography noWrap variant="h6">
          Entreprise : {storeSyncedWithLocalStorage.companyName()}
        </Typography>
      </div>
      <Divider className="full-width-divider" />
      <Container className="admin-container">
        <Button
          variant="contained"
          color="primary"
          onClick={async e => {
            e.preventDefault();
            const response = await api.httpQuery(
              "GET",
              `/download_company_activity_report/${storeSyncedWithLocalStorage.companyId()}`
            );
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "rapport_activité.xlsx";
            link.dispatchEvent(new MouseEvent("click"));
          }}
        >
          Télécharger rapport d'activité
        </Button>
      </Container>
    </Container>
  );
}
