import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useSnackbarAlerts } from "./Snackbar";
import { STOP_IMPERSONATION_MUTATION } from "common/utils/apiQueries/impersonation";
import Notice from "./Notice";

export function ImpersonationBanner() {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [stopping, setStopping] = React.useState(false);

  const userInfo = store.userInfo();
  if (!userInfo?.isImpersonated) return null;

  const displayName =
    [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(" ") ||
    "utilisateur";

  const handleStop = async () => {
    setStopping(true);
    try {
      await alerts.withApiErrorHandling(async () => {
        await api.graphQlMutate(
          STOP_IMPERSONATION_MUTATION,
          {},
          { context: { nonPublicApi: true } }
        );
        sessionStorage.setItem("impersonationReturn", "true");
        await store.updateUserIdAndInfo();
      }, "stop-impersonation");
    } finally {
      setStopping(false);
    }
  };

  return (
    <div role="status" aria-live="polite" style={{ width: "100%" }}>
      <Notice
        type="warning"
        isFullWidth
        style={{ padding: "12px 0" }}
        title={`Connecté en tant que ${displayName} — Mode support`}
        description={
          <Button
            size="small"
            priority="secondary"
            onClick={handleStop}
            disabled={stopping}
            style={{ marginLeft: 16 }}
          >
            {stopping ? "Déconnexion..." : "Quitter le compte"}
          </Button>
        }
      />
    </div>
  );
}
