import React from "react";
import { FunnelModal } from "./FunnelModal";
import NewMissionForm from "../../common/NewMissionForm";

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

  React.useEffect(() => {
    if (open && !disableCurrentPosition && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentPosition(position);
      });
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
