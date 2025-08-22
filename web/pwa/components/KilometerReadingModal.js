import React from "react";
import KilometerReadingField from "../../common/KilometerReadingField";
import { LoadingButton } from "common/components/LoadingButton";
import Modal from "../../common/Modal";

export default function KilometerReadingModal({
  open,
  handleKilometerReading,
  minReading = null,
  maxReading = null,
  currentKilometerReading = null,
  isStart,
  handleClose
}) {
  const [kilometerReading, setKilometerReading] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (open) {
      setError(null);
      setKilometerReading(currentKilometerReading);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      size="sm"
      title={`Relevé kilométrique de ${isStart ? "début" : "fin"} de service`}
      content={
        <KilometerReadingField
          kilometerReading={kilometerReading}
          setKilometerReading={setKilometerReading}
          error={error}
          setError={setError}
          minReading={minReading}
          maxReading={maxReading}
        />
      }
      actions={
        <>
          <LoadingButton
            disabled={!!error}
            onClick={async () => {
              await handleKilometerReading(kilometerReading);
              handleClose();
            }}
          >
            OK
          </LoadingButton>
        </>
      }
    />
  );
}
