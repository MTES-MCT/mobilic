import React from "react";
import { ControllerControlHeader } from "../../details/ControllerControlHeader";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { ControlBulletinDrawer } from "../../controlBulletin/ControlBulletinDrawer";
import { ControlDrawer } from "../../../utils/ControlDrawer";
import { useInfractions } from "../../../utils/contextInfractions";
import { ControlTakePicturesDrawer } from "../../pictures/ControlTakePicturesDrawer";

export function ControllerControlNoLicDrawer({
  controlData,
  setControlData,
  isOpen,
  onClose
}) {
  const [isEditingBDC, setIsEditingBDC] = React.useState(false);
  const [displayTakePictures, setDisplayTakePictures] = React.useState(false);
  const { setIsReportingInfractions } = useInfractions();
  const takePictures = () => {
    setDisplayTakePictures(true);
  };
  const editBDC = () => {
    setIsEditingBDC(true);
  };

  const closeControl = () => {
    setControlData(null);
    setIsReportingInfractions(false);
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
      <ControlTakePicturesDrawer
        isOpen={displayTakePictures}
        onClose={() => setDisplayTakePictures(false)}
      />
      <ControllerControlHeader
        controlDate={controlData.controlTime}
        onCloseDrawer={() => closeControl()}
      />
      <ControllerControlNoLic editBDC={editBDC} takePictures={takePictures} />
    </ControlDrawer>
  );
}
