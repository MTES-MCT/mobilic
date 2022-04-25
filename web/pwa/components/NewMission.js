import React from "react";
import { FunnelModal } from "./FunnelModal";
import NewMissionForm from "../../common/NewMissionForm";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { DISMISSABLE_WARNINGS } from "../../admin/utils/dismissableWarnings";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { setCurrentLocation } from "common/utils/location";

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
  const alerts = useSnackbarAlerts();

  const askCurrentPosition = (askedByUser = true) => {
    if (open && !disableCurrentPosition) {
      setCurrentLocation(setCurrentPosition, alerts, askedByUser);
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
        modals.open("geolocPermissionInfoModal", {
          askCurrentPosition
        });
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
        askCurrentPosition={askCurrentPosition}
        disableGeolocation={disableCurrentPosition}
      />
    </FunnelModal>
  );
}
