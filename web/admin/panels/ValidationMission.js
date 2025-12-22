import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { formatDay } from "common/utils/time";
import { LoadingButton } from "common/components/LoadingButton";
import { VALIDATE_MISSION_IN_VALIDATION_PANEL } from "common/utils/matomoTags";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { useStyles } from "../components/styles/ValidationsStyle";
import { useMissionActions } from "../utils/missionActions";

const formatMissionName = (mission) =>
  `${mission.isHoliday ? "" : "Mission "}${mission.name} du ${formatDay(
    mission.startTime
  )}`;

function ValidationMission({ tab, mission, entriesToValidateByAdmin }) {
  const { trackEvent } = useMatomo();
  const classes = useStyles();
  const missionActions = useMissionActions(mission);

  return (
    <Box className="flex-row-space-between">
      <Typography
        variant="h6"
        component="span"
        className={classes.missionTitle}
      >
        {formatMissionName(mission)}
      </Typography>
      {tab === 0 && (
        <LoadingButton
          size="small"
          onClick={async (e) => {
            e.stopPropagation();
            trackEvent(VALIDATE_MISSION_IN_VALIDATION_PANEL);
            const usersToValidate = entriesToValidateByAdmin
              .filter(
                (entryToValidate) => entryToValidate.missionId === mission.id
              )
              .map((workerEntryToValidate) => workerEntryToValidate.user.id);
            missionActions.validateMission(usersToValidate);
          }}
        >
          Valider
        </LoadingButton>
      )}
    </Box>
  );
}

export default ValidationMission;
