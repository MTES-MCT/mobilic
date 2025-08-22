import React from "react";
import { ControllerControlDetails } from "./ControllerControlDetails";
import { CONTROL_TYPES } from "../../utils/useReadControlData";
import { ControllerControlNoLicDrawer } from "../noQRCode/noLic/ControllerControlNoLicDrawer";
import { ControlDrawer } from "../../utils/ControlDrawer";
import { InfractionsProvider } from "../../utils/contextInfractions";
import { ControlProvider, useControl } from "../../utils/contextControl";

const InnerControllerControlDrawer = ({ onClose }) => {
  const { controlData, setControlData, controlId, controlType } = useControl();

  if (!controlData) {
    return null;
  }

  return (
    <InfractionsProvider controlData={controlData}>
      {controlType === CONTROL_TYPES.MOBILIC.label ? (
        <ControlDrawer
          isOpen={!!controlId}
          onClose={onClose}
          controlId={controlId}
        >
          <ControllerControlDetails
            controlData={controlData}
            setControlData={setControlData}
            onClose={onClose}
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
