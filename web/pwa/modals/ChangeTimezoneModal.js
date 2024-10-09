import React from "react";
import { LoadingButton } from "common/components/LoadingButton";

import { getClientTimezone } from "common/utils/timezones";
import { useSnackbarAlerts } from "../../common/Snackbar";

import TimezoneSelect from "../../common/TimezoneSelect";
import Modal from "../../common/Modal";

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
    <Modal
      size="sm"
      title="Modifier votre fuseau horaire"
      open={open}
      handleClose={handleClose}
      content={
        <form
          id="udpate-timezone-form"
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            await alerts.withApiErrorHandling(async () => {
              await handleSubmit(selectedTimezone);
              handleClose();
            }, "change-timezone");
          }}
        >
          <TimezoneSelect
            currentTimezone={selectedTimezone}
            setTimezone={setSelectedTimezone}
          />
        </form>
      }
      actions={
        <LoadingButton type="submit" form="udpate-timezone-form">
          Enregistrer
        </LoadingButton>
      }
    />
  );
}
