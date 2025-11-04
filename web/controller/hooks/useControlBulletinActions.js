import React from "react";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  SEND_CONTROL_BULLETIN_EMAIL_MUTATION,
  CONTROLLER_UPDATE_DELIVERY_STATUS
} from "common/utils/apiQueries";

export function useControlBulletinActions({
  controlId,
  controlData,
  onControlDataUpdate
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [handDelivered, setHandDelivered] = React.useState(
    controlData?.deliveredByHand || false
  );
  const [openSendModal, setOpenSendModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isHandDeliveryModalOpen, setIsHandDeliveryModalOpen] = React.useState(
    false
  );

  React.useEffect(() => {
    setHandDelivered(controlData?.deliveredByHand || false);
  }, [controlData?.deliveredByHand]);

  const saveHandDeliveryStatus = React.useCallback(
    async delivered => {
      try {
        if (!controlId) {
          return;
        }

        const response = await api.graphQlMutate(
          CONTROLLER_UPDATE_DELIVERY_STATUS,
          {
            controlId,
            deliveredByHand: delivered
          },
          { context: { nonPublicApi: true } }
        );

        if (
          response?.data?.controllerUpdateDeliveryStatus &&
          onControlDataUpdate
        ) {
          onControlDataUpdate(response.data.controllerUpdateDeliveryStatus);
        }

        alerts.success(
          delivered
            ? "Enregistré comme remis en main propre"
            : "Enregistré comme non remis en main propre",
          "",
          3000
        );
      } catch {
        alerts.error("Erreur lors de la sauvegarde", "", 3000);
        setHandDelivered(!delivered);
      }
    },
    [api, controlId, alerts, onControlDataUpdate]
  );

  const handleHandDeliveredChange = React.useCallback(
    e => {
      const newValue = e.target.checked;
      setHandDelivered(newValue);
      saveHandDeliveryStatus(newValue);
    },
    [saveHandDeliveryStatus]
  );

  const handleSend = React.useCallback(
    async (adminEmails = null) => {
      setIsLoading(true);
      let success = false;

      try {
        await alerts.withApiErrorHandling(async () => {
          const variables = {
            controlId: controlId.toString()
          };

          if (adminEmails) {
            variables.adminEmails = adminEmails;
          }

          const response = await api.graphQlMutate(
            SEND_CONTROL_BULLETIN_EMAIL_MUTATION,
            variables,
            { context: { nonPublicApi: true } }
          );

          const {
            success: apiSuccess,
            nbEmailsSent
          } = response.data.sendControlBulletinEmail;

          if (apiSuccess) {
            success = true;

            if (onControlDataUpdate) {
              onControlDataUpdate(prevData => ({
                ...prevData,
                sentToAdmin: true
              }));
            }

            alerts.success(
              `Bulletin de contrôle envoyé avec succès à ${nbEmailsSent} gestionnaire(s)`,
              "",
              6000
            );
          }
        }, "send-control-bulletin");
      } finally {
        setIsLoading(false);
      }

      return success;
    },
    [alerts, api, controlId, onControlDataUpdate]
  );

  const handleHandDeliveryConfirm = React.useCallback(
    async delivered => {
      setHandDelivered(delivered);
      await saveHandDeliveryStatus(delivered);
      setIsHandDeliveryModalOpen(false);
    },
    [saveHandDeliveryStatus]
  );

  const handleHandDeliveryConfirmWithoutClose = React.useCallback(
    async delivered => {
      setHandDelivered(delivered);
      await saveHandDeliveryStatus(delivered);
    },
    [saveHandDeliveryStatus]
  );

  const openHandDeliveryModalAction = React.useCallback(() => {
    setIsHandDeliveryModalOpen(true);
  }, []);

  return {
    handDelivered,
    openSendModal,
    isLoading,
    isHandDeliveryModalOpen,
    setOpenSendModal,
    setIsHandDeliveryModalOpen,
    handleHandDeliveredChange,
    handleSend,
    handleHandDeliveryConfirm,
    handleHandDeliveryConfirmWithoutClose,
    openHandDeliveryModal: openHandDeliveryModalAction
  };
}
