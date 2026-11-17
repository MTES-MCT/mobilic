import React from "react";
import PropTypes from "prop-types";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { LoadingButton } from "common/components/LoadingButton";
import { VALIDATE_MISSION_IN_VALIDATION_PANEL } from "common/utils/matomoTags";
import { formatPersonName } from "common/utils/coworkers";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { validateMission } from "../utils/missionActions";

export function ValidateMissionButton({ mission, user }) {
  const { trackEvent } = useMatomo();
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();

  return (
    <LoadingButton
      priority="secondary"
      size="small"
      onClick={async (e) => {
        e.stopPropagation();
        trackEvent(VALIDATE_MISSION_IN_VALIDATION_PANEL);
        try {
          await validateMission(api, mission, adminStore, [user.id]);
          adminStore.dispatch({
            type: ADMIN_ACTIONS.update,
            payload: { id: mission.id, entity: "missions", update: mission }
          });
          alerts.success(
            `Mission de ${formatPersonName(user)} validée.`,
            mission.id,
            6000
          );
        } catch (err) {
          console.error(err);
          alerts.error(
            "La mission n'a pas pu être validée. Réessayez.",
            mission.id,
            6000
          );
        }
      }}
    >
      Valider
    </LoadingButton>
  );
}

ValidateMissionButton.propTypes = {
  mission: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) })
    .isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  }).isRequired
};
