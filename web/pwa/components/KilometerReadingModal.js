import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import KilometerReadingInput from "./KilometerReadingInput";
import { LoadingButton } from "common/components/LoadingButton";

export default function KilometerReadingModal({
  open,
  handleKilometerReading,
  minReading = null,
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
        <KilometerReadingInput
          kilometerReading={kilometerReading}
          setKilometerReading={setKilometerReading}
          error={error}
          setError={setError}
          minReading={minReading}
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
