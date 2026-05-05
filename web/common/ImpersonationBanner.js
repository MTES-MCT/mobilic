import React from "react";
import { useHistory } from "react-router-dom";
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
  const history = useHistory();
  const [stopping, setStopping] = React.useState(false);

  // Re-validate isImpersonated against the backend at mount: the flag is
  // stored in localStorage (manipulable from DevTools), but the backend
  // is the source of truth for the JWT-driven impersonation state.
  React.useEffect(() => {
    store.updateUserIdAndInfo();
  }, []);

  const userInfo = store.userInfo();
  if (!userInfo?.isImpersonated) return null;

  const displayName =
    [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(" ") ||
    "utilisateur";

  const handleStop = async () => {
    setStopping(true);
    try {
      await alerts.withApiErrorHandling(
        async () => {
          await api.graphQlMutate(
            STOP_IMPERSONATION_MUTATION,
            {},
            { context: { nonPublicApi: true } }
          );
          sessionStorage.setItem("impersonationReturn", "true");
          await store.updateUserIdAndInfo();
        },
        "stop-impersonation",
        null,
        () => {
          // Mutation failed: force a full logout to leave Kelly in a clean state.
          history.push("/logout");
        }
      );
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
