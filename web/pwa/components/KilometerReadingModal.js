import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import KilometerReadingField from "../../common/KilometerReadingField";
import { LoadingButton } from "common/components/LoadingButton";

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
    <Dialog onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle
        title={`Relevé kilométrique de ${isStart ? "début" : "fin"} de service`}
        handleClose={handleClose}
      />
      <DialogContent>
        <KilometerReadingField
          kilometerReading={kilometerReading}
          setKilometerReading={setKilometerReading}
          error={error}
          setError={setError}
          minReading={minReading}
          maxReading={maxReading}
        />
      </DialogContent>
      <CustomDialogActions>
        <LoadingButton
          color="primary"
          variant="contained"
          disabled={!!error}
          onClick={async () => {
            await handleKilometerReading(kilometerReading);
            handleClose();
          }}
        >
          OK
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
