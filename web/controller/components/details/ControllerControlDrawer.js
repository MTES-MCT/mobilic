import React from "react";
import { ControllerControlDetails } from "./ControllerControlDetails";
import {
  CONTROL_TYPES,
  useReadControlData
} from "../../utils/useReadControlData";
import { ControllerControlNoLicDrawer } from "../noQRCode/noLic/ControllerControlNoLicDrawer";
import { ControlDrawer } from "../../utils/ControlDrawer";
import { InfractionsProvider } from "../../utils/contextInfractions";

export function ControllerControlDrawer({ controlId, controlType, onClose }) {
  const [controlData, setControlData] = useReadControlData(
    controlId,
    controlType
  );

  if (!controlData) {
    return null;
  }

  return (
    <InfractionsProvider controlData={controlData}>
      {controlType === CONTROL_TYPES.MOBILIC ? (
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
          controlType={controlType}
          controlData={controlData}
          setControlData={setControlData}
          isOpen={!!controlId}
          onClose={onClose}
        />
      )}
    </InfractionsProvider>
  );
}
