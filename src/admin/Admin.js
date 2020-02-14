import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/core/SvgIcon/SvgIcon";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";
import { useApi } from "../common/utils/api";
import Button from "@material-ui/core/Button";
import { ModalContext } from "../common/utils/modals";
import { loadUserData } from "../common/utils/loadUserData";
import { formatPersonName } from "../common/utils/coworkers";

export function Admin() {
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const modals = React.useContext(ModalContext);

  React.useEffect(() => {
    loadUserData(api, storeSyncedWithLocalStorage);
    return () => {};
  }, []);

  const userInfo = storeSyncedWithLocalStorage.userInfo();

  return (
    <Container>
      <div className="user-name-header">
        <Typography noWrap variant="h6">
          {formatPersonName(userInfo)}
        </Typography>
        <Typography noWrap variant="h6">
          Entreprise : {userInfo.companyName}
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
              `/download_company_activity_report/${userInfo.companyId}`
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
