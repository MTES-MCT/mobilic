import React from "react";
import { LoadingButton } from "common/components/LoadingButton";

import { now, sameMinute, truncateMinute } from "common/utils/time";
import _ from "lodash";
import Modal from "../../../common/Modal";
import Notice from "../../../common/Notice";
import { NativeDateTimePicker } from "../../../common/NativeDateTimePicker";
import { CONTROLLER_UPDATE_CONTROL_TIME } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import {
  CONTROL_WITH_SAME_CONTROL_TIME_ERROR_CODE,
  formatApiError
} from "common/utils/errors";

export default function ControllerUpdateTimeModal({
  open,
  handleClose,
  controlData,
  setControlData
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [newTime, setNewTime] = React.useState(controlData.controlTime);
  const [error, setError] = React.useState("");

  const canSubmit = React.useMemo(
    () => !error && newTime && !sameMinute(newTime, controlData.controlTime),
    [newTime, controlData.controlTime, error]
  );

  React.useEffect(() => {
    setError("");
    if (newTime && newTime > now()) {
      setError("L'heure ne peut pas être dans le futur.");
    }
  }, [newTime]);

  const updateControlTime = async newTime => {
    try {
      const apiResponse = await api.graphQlMutate(
        CONTROLLER_UPDATE_CONTROL_TIME,
        {
          controlId: controlData?.id,
          newTime
        },
        { context: { nonPublicApi: true } }
      );
      setControlData({
        ...controlData,
        controlTime: apiResponse.data.controllerUpdateControlTime.controlTime
      });
      alerts.success(
        "L'heure du contrôle a été mise à jour",
        "update-control-time",
        6000
      );
      handleClose();
    } catch (err) {
      const formattedError = formatApiError(err);
      alerts.error(formattedError, "", 6000);
      if (
        err.graphQLErrors?.length ||
        (0 > 1 &&
          err.graphQLErrors[0].extensions?.code ===
            CONTROL_WITH_SAME_CONTROL_TIME_ERROR_CODE)
      ) {
        setError(formattedError);
      }
    }
  };

  return (
    <Modal
      size="md"
      title={`Modifier la date et l’heure du contrôle #${controlData.id}`}
      open={open}
      handleClose={handleClose}
      content={
        <form
          id="udpate-time-form"
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            updateControlTime(newTime);
          }}
        >
          <Notice
            description="Si vous n’avez pas créé ce contrôle en temps réel, veillez à
            modifier la date et/ou l’heure afin que vous puissiez importer ce
            contrôle dans Greco. La date et l’heure doivent correspondre à une
            plage de contrôle indiquée dans Greco."
            sx={{ marginBottom: 4 }}
          />
          <NativeDateTimePicker
            label="Date et heure"
            value={newTime}
            setValue={_.flow([truncateMinute, setNewTime])}
            // minDateTime={previousMissionEnd}
            maxDateTime={now()}
            fullWidth
            required
            variant="filled"
            error={error}
          />
        </form>
      }
      actions={
        <>
          <LoadingButton
            type="submit"
            form="udpate-time-form"
            disabled={!canSubmit}
          >
            Enregistrer
          </LoadingButton>
        </>
      }
    />
  );
}
