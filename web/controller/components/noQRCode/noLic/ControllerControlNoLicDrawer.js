import React from "react";
import { ControllerControlHeader } from "../../details/ControllerControlHeader";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { ControlBulletinDrawer } from "../../controlBulletin/ControlBulletinDrawer";
import { ControlDrawer } from "../../../utils/ControlDrawer";
import { canDownloadBDC } from "../../../utils/controlBulletin";

export function ControllerControlNoLicDrawer({
  controlType,
  controlData,
  setControlData,
  isOpen,
  onClose
}) {
  const [isEditingBDC, setIsEditingBDC] = React.useState(false);

  const editBDC = () => {
    setIsEditingBDC(true);
  };

  const closeControl = () => {
    setControlData(null);
    onClose();
  };

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
      <ControllerControlHeader
        controlId={controlData.id}
        controlDate={controlData.creationTime}
        onCloseDrawer={() => closeControl()}
        canDownloadXml={canDownloadBDC(controlData)}
        enableExport={false}
      />
      <ControllerControlNoLic
        controlType={controlType}
        controlData={controlData}
        editBDC={editBDC}
      />
    </ControlDrawer>
  );
}
