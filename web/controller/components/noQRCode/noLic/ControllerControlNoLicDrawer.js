import React from "react";
import { ControllerControlHeader } from "../../details/ControllerControlHeader";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { ControlBulletinDrawer } from "../../controlBulletin/ControlBulletinDrawer";
import { ControlDrawer } from "../../../utils/ControlDrawer";

export function ControllerControlNoLicDrawer({
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
        controlDate={controlData.creationTime}
        onCloseDrawer={() => closeControl()}
        enableExport={false}
      />
      <ControllerControlNoLic editBDC={editBDC} />
    </ControlDrawer>
  );
}
