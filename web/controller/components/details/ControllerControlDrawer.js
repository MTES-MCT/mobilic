import React from "react";
import { ControllerControlDetails } from "./ControllerControlDetails";
import { CONTROL_TYPES } from "../../utils/useReadControlData";
import { ControllerControlNoLicDrawer } from "../noQRCode/noLic/ControllerControlNoLicDrawer";
import { ControlDrawer } from "../../utils/ControlDrawer";
import { InfractionsProvider } from "../../utils/contextInfractions";
import { ControlProvider, useControl } from "../../utils/contextControl";
import { useControlBulletinActions } from "../../hooks/useControlBulletinActions";
import ControlHandDeliveryModal from "../modals/ControlHandDeliveryModal";

const InnerControllerControlDrawer = ({ onClose }) => {
  const { controlData, setControlData, controlId, controlType } = useControl();
  const actions = useControlBulletinActions({
    controlId,
    controlData,
    onControlDataUpdate: setControlData
  });

  const handleClose = React.useCallback(() => {
    const bulletinExists = !!controlData?.controlBulletinCreationTime;
    const deliveryNotSet = controlData?.deliveredByHand === null;

    if (bulletinExists && deliveryNotSet) {
      actions.openHandDeliveryModal();
    } else {
      onClose();
    }
  }, [controlData, onClose, actions]);

  if (!controlData) {
    return null;
  }

  return (
    <InfractionsProvider controlData={controlData}>
      {controlType === CONTROL_TYPES.MOBILIC.label ? (
        <ControlDrawer
          isOpen={!!controlId}
          onClose={handleClose}
          controlId={controlId}
        >
          <ControllerControlDetails
            controlData={controlData}
            setControlData={setControlData}
            onClose={handleClose}
          />
        </ControlDrawer>
      ) : (
        <ControllerControlNoLicDrawer
          controlData={controlData}
          setControlData={setControlData}
          isOpen={!!controlId}
          onClose={onClose}
        />
      )}

      <ControlHandDeliveryModal
        open={actions.isHandDeliveryModalOpen}
        handleConfirm={async () => {
          await actions.handleHandDeliveryConfirmWithoutClose(true);
          actions.setIsHandDeliveryModalOpen(false);
          onClose();
        }}
        handleCancel={async () => {
          await actions.handleHandDeliveryConfirmWithoutClose(false);
          actions.setIsHandDeliveryModalOpen(false);
          onClose();
        }}
      />
    </InfractionsProvider>
  );
};
export function ControllerControlDrawer({ controlId, controlType, onClose }) {
  return (
    <ControlProvider controlId={controlId} controlType={controlType}>
      <InnerControllerControlDrawer onClose={onClose} />
    </ControlProvider>
  );
}
