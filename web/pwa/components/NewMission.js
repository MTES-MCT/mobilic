import React from "react";
import { FunnelModal } from "./FunnelModal";
import NewMissionForm from "../../common/NewMissionForm";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { DISMISSABLE_WARNINGS } from "../../admin/utils/dismissableWarnings";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";

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

  const askCurrentPosition = () => {
    if (open && !disableCurrentPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setCurrentPosition(position);
        },
        error => {
          switch (error.code) {
            case 1:
              alerts.error(
                "L'autorisation de localisation a été refusée. Pour l'activer, allez dans les paramètres de sécurité de votre navigateur.",
                {},
                6000
              );
              break;
            default:
              alerts.error(
                "La localisation est momentanément indisponible sur le téléphone. Veuillez réessayer plus tard.",
                {},
                6000
              );
          }
        }
      );
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
          askCurrentPosition,
          disableGeolocation: { disableCurrentPosition }
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
      />
    </FunnelModal>
  );
}
