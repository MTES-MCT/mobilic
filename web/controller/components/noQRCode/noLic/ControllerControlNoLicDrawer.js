import React from "react";
import { ControllerControlHeader } from "../../details/ControllerControlHeader";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { ControlBulletinDrawer } from "../../controlBulletin/ControlBulletinDrawer";
import { ControlDrawer } from "../../../utils/ControlDrawer";
import { useInfractions } from "../../../utils/contextInfractions";
import { ControlTakePicturesDrawer } from "../../pictures/ControlTakePicturesDrawer";
import { useControlBulletinActions } from "../../../hooks/useControlBulletinActions";
import ControlHandDeliveryModal from "../../modals/ControlHandDeliveryModal";

export function ControllerControlNoLicDrawer({
  controlData,
  setControlData,
  isOpen,
  onClose
}) {
  const [isEditingBDC, setIsEditingBDC] = React.useState(false);
  const [displayTakePictures, setDisplayTakePictures] = React.useState(false);
  const { setIsReportingInfractions } = useInfractions();
  const actions = useControlBulletinActions({
    controlId: controlData?.id,
    controlData,
    onControlDataUpdate: setControlData
  });

  const takePictures = () => {
    setDisplayTakePictures(true);
  };
  const editBDC = () => {
    setIsEditingBDC(true);
  };

  const actuallyCloseDrawer = React.useCallback(() => {
    setControlData(null);
    setIsReportingInfractions(false);
    onClose();
  }, [setControlData, setIsReportingInfractions, onClose]);

  const closeControl = React.useCallback(() => {
    const bulletinExists = !!controlData?.controlBulletinCreationTime;
    const deliveryNotSet = controlData?.deliveredByHand === null;

    if (bulletinExists && deliveryNotSet) {
      actions.openHandDeliveryModal();
    } else {
      actuallyCloseDrawer();
    }
  }, [controlData, actions, actuallyCloseDrawer]);

  return (
    <ControlDrawer
      isOpen={isOpen}
      onClose={() => closeControl()}
      controlId={controlData.id}
    >
      <ControlBulletinDrawer
        isOpen={isEditingBDC}
        onClose={() => setIsEditingBDC(false)}
        controlData={controlData}
        onSaveControlBulletin={newData =>
          setControlData(prevControlData => ({
            ...prevControlData,
            ...newData
          }))
        }
      />
      <ControlTakePicturesDrawer
        isOpen={displayTakePictures}
        onClose={() => setDisplayTakePictures(false)}
      />
      <ControllerControlHeader
        controlDate={controlData.controlTime}
        onCloseDrawer={() => closeControl()}
      />
      <ControllerControlNoLic editBDC={editBDC} takePictures={takePictures} />

      <ControlHandDeliveryModal
        open={actions.isHandDeliveryModalOpen}
        handleConfirm={async () => {
          await actions.handleHandDeliveryConfirmWithoutClose(true);
          actions.setIsHandDeliveryModalOpen(false);
          actuallyCloseDrawer();
        }}
        handleCancel={async () => {
          await actions.handleHandDeliveryConfirmWithoutClose(false);
          actions.setIsHandDeliveryModalOpen(false);
          actuallyCloseDrawer();
        }}
      />
    </ControlDrawer>
  );
}
