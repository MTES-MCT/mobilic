import React from "react";
import { FunnelModal } from "./FunnelModal";
import NewMissionForm from "../../common/NewMissionForm";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { DISMISSABLE_WARNINGS } from "../../admin/utils/dismissableWarnings";
import { useModals } from "common/utils/modals";

export default function NewMissionModal({
  open,
  handleClose,
  handleContinue,
  companies,
  companyAddresses = [],
  disableCurrentPosition = false,
  disableKilometerReading = false,
  withDay = false,
  withEndLocation = false
}) {
  const [currentPosition, setCurrentPosition] = React.useState(null);

  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const modals = useModals();

  const askLocationPermission = () => {
    if (open && !disableCurrentPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentPosition(position);
      });
    }
  };

  React.useEffect(() => {
    if (open && !disableCurrentPosition) {
      if (
        !userInfo.disabledWarnings ||
        !userInfo.disabledWarnings.includes(
          DISMISSABLE_WARNINGS.EMPLOYEE_GEOLOCATION_INFORMATION
        )
      ) {
        modals.open("geolocPermissionInfoModal", { askLocationPermission });
      }
    }
  }, [open]);

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <NewMissionForm
        handleSubmit={handleContinue}
        companies={companies}
        companyAddresses={companyAddresses}
        currentPosition={disableCurrentPosition ? null : currentPosition}
        disableKilometerReading={disableKilometerReading}
        withDay={withDay}
        withEndLocation={withEndLocation}
      />
    </FunnelModal>
  );
}
