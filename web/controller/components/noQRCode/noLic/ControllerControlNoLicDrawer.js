import React from "react";
import { ControllerControlHeader } from "../../details/ControllerControlHeader";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { ControlBulletinDrawer } from "../../controlBulletin/ControlBulletinDrawer";
import { ControlDrawer } from "../../../utils/ControlDrawer";
import { useInfractions } from "../../../utils/contextInfractions";
import { ControlDisplayPicturesDrawer } from "../../pictures/ControlDisplayPicturesDrawer";

export function ControllerControlNoLicDrawer({
  controlData,
  setControlData,
  isOpen,
  onClose
}) {
  const [isEditingBDC, setIsEditingBDC] = React.useState(false);
  const [displayPictures, setDisplayPictures] = React.useState(false);
  const { setIsReportingInfractions } = useInfractions();

  const editBDC = () => {
    setIsEditingBDC(true);
  };

  const showPictures = () => {
    setDisplayPictures(true);
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
      <ControlDisplayPicturesDrawer
        isOpen={displayPictures}
        onClose={() => setDisplayPictures(false)}
      />
      <ControllerControlHeader
        controlDate={controlData.creationTime}
        onCloseDrawer={() => closeControl()}
      />
      <ControllerControlNoLic editBDC={editBDC} showPictures={showPictures} />
    </ControlDrawer>
  );
}
