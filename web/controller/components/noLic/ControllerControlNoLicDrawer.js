import React from "react";
import { ControllerControlHeader } from "../details/ControllerControlHeader";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { ControlBulletinDrawer } from "../controlBulletin/ControlBulletinDrawer";
import { ControlDrawer } from "../../utils/ControlDrawer";
import { useReportInfractions } from "../../utils/useReportInfractions";
import { canDownloadBDC } from "../../utils/controlBulletin";

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

  const [
    reportedInfractionsLastUpdateTime,
    groupedAlerts,
    checkedAlertsNumber,
    totalAlertsNumber,
    isReportingInfractions,
    setIsReportingInfractions,
    hasModifiedInfractions,
    saveInfractions,
    cancelInfractions,
    onUpdateInfraction
  ] = useReportInfractions(controlData);
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
        groupedAlerts={groupedAlerts}
        saveInfractions={saveInfractions}
        onUpdateInfraction={onUpdateInfraction}
        cancelInfractions={cancelInfractions}
      />
      <ControllerControlHeader
        controlId={controlData.id}
        controlDate={controlData.creationTime}
        onCloseDrawer={() => closeControl()}
        canDownloadXml={canDownloadBDC(controlData)}
        enableExport={false}
      />
      <ControllerControlNoLic
        controlData={controlData}
        editBDC={editBDC}
        isReportingInfractions={isReportingInfractions}
        setIsReportingInfractions={setIsReportingInfractions}
        groupedAlerts={groupedAlerts}
        totalAlertsNumber={totalAlertsNumber}
        saveInfractions={saveInfractions}
        cancelInfractions={cancelInfractions}
        onUpdateInfraction={onUpdateInfraction}
        hasModifiedInfractions={hasModifiedInfractions}
        reportedInfractionsLastUpdateTime={reportedInfractionsLastUpdateTime}
        checkedAlertsNumber={checkedAlertsNumber}
      />
    </ControlDrawer>
  );
}
