import React from "react";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useModals } from "common/utils/modals";
import {
  SEND_CONTROL_BULLETIN_EMAIL_MUTATION,
  CONTROLLER_SAVE_CONTROL_BULLETIN
} from "common/utils/apiQueries";

export function useControlBulletinActions({
  controlId,
  controlData,
  adminEmails,
  displayCompanyName,
  controlTime,
  includePdf
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const modals = useModals();

  const [handDelivered, setHandDelivered] = React.useState(
    controlData?.deliveredByHand || false
  );
  const [openSendModal, setOpenSendModal] = React.useState(false);
  const [sendToDriver, setSendToDriver] = React.useState(false);
  const [sendToAdmin, setSendToAdmin] = React.useState(
    controlData?.sendToAdmin || false
  );
  const [isLoading, setIsLoading] = React.useState(false);

  // Synchroniser l'état avec les données du contrôle
  React.useEffect(() => {
    if (controlData?.deliveredByHand !== undefined) {
      setHandDelivered(controlData.deliveredByHand);
    }
    if (controlData?.sendToAdmin !== undefined) {
      setSendToAdmin(controlData.sendToAdmin);
    }
  }, [controlData?.deliveredByHand, controlData?.sendToAdmin]);

  const saveHandDeliveryStatus = React.useCallback(
    async delivered => {
      try {
        await api.graphQlMutate(
          CONTROLLER_SAVE_CONTROL_BULLETIN,
          {
            controlId: controlId,
            deliveredByHand: delivered
          },
          { context: { nonPublicApi: true } }
        );

        alerts.success(
          delivered
            ? "Enregistré comme remis en main propre"
            : "Enregistré comme non remis en main propre",
          "",
          3000
        );
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        alerts.error("Erreur lors de la sauvegarde", "", 3000);
        setHandDelivered(!delivered);
      }
    },
    [api, controlId, alerts]
  );

  const handleHandDeliveredChange = React.useCallback(
    e => {
      const newValue = e.target.checked;
      setHandDelivered(newValue);
      saveHandDeliveryStatus(newValue);
    },
    [controlData?.deliveredByHand, modals, saveHandDeliveryStatus]
  );

  const handleSend = React.useCallback(
    async (emailOverride = null) => {
      setIsLoading(true);

      try {
        const effectiveEmails = emailOverride || adminEmails;

        if (effectiveEmails.length > 0) {
          await alerts.withApiErrorHandling(async () => {
            const response = await api.graphQlMutate(
              SEND_CONTROL_BULLETIN_EMAIL_MUTATION,
              {
                controlId: controlId.toString(),
                adminEmails: Array.isArray(effectiveEmails)
                  ? effectiveEmails
                  : [effectiveEmails],
                companyName: displayCompanyName || "Entreprise",
                controlDate: controlTime,
                includePdf: includePdf
              },
              { context: { nonPublicApi: true } }
            );

            const {
              success,
              emailsSent
            } = response.data.sendControlBulletinEmail;

            if (success) {
              setSendToAdmin(true);

              alerts.success(
                `Bulletin de contrôle envoyé avec succès à ${emailsSent} gestionnaire(s)`,
                "",
                6000
              );
            }
          }, "send-control-bulletin");
        } else {
          alerts.error(
            "Erreur lors de l'envoi : Mauvais siren ou pas de gestionnaire associé à cette entreprise.",
            "",
            6000
          );
        }

        setOpenSendModal(false);
      } catch (error) {
        console.error("Erreur lors de l'envoi:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      sendToAdmin,
      adminEmails,
      alerts,
      api,
      controlId,
      displayCompanyName,
      controlTime,
      includePdf,
      setSendToAdmin
    ]
  );

  return {
    // États
    handDelivered,
    openSendModal,
    sendToDriver,
    sendToAdmin,
    isLoading,

    // Setters
    setOpenSendModal,
    setSendToDriver,
    setSendToAdmin,

    // Actions
    handleHandDeliveredChange,
    handleSend
  };
}
