import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../common/CustomDialogTitle";
import { useSnackbarAlerts } from "../common/Snackbar";
import { getClientTimezone } from "common/utils/timezones";
import TimezoneSelect from "../common/TimezoneSelect";

export default function ChangeTimezoneModal({
  open,
  handleClose,
  handleSubmit,
  defaultValue
}) {
  const [selectedTimezone, setSelectedTimezone] = React.useState(
    defaultValue || getClientTimezone()
  );
  const alerts = useSnackbarAlerts();

  return (
    <Dialog maxWidth="sm" onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle
        handleClose={handleClose}
        title="Modifier votre fuseau horaire"
      />
      <form
        autoComplete="off"
        onSubmit={async e => {
          e.preventDefault();
          await alerts.withApiErrorHandling(async () => {
            await handleSubmit(selectedTimezone);
            handleClose();
          }, "change-timezone");
        }}
      >
        <DialogContent>
          <TimezoneSelect
            currentTimezone={selectedTimezone}
            setTimezone={setSelectedTimezone}
          />
        </DialogContent>
        <CustomDialogActions>
          <LoadingButton type="submit" color="primary">
            Enregistrer
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
