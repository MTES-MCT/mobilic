import React from "react";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";
import { useApi } from "../common/utils/api";
import Button from "@material-ui/core/Button";
import { loadUserData } from "../common/utils/loadUserData";
import { UserNameHeader } from "../common/components/UserNameHeader";

export function Admin() {
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const api = useApi();

  React.useEffect(() => {
    loadUserData(api, storeSyncedWithLocalStorage);
    return () => {};
  }, []);

  const userInfo = storeSyncedWithLocalStorage.userInfo();

  return (
    <Container style={{ height: "100%" }}>
      <UserNameHeader />
      <Container className="admin-container flexbox-center">
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
