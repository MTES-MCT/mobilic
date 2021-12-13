import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { ActivityList } from "../ActivityList";
import { ACTIVITIES_OPERATIONS } from "common/utils/activities";

export default function OverlappedActivityList({ activitiesOperations }) {
  const activitiesToCancel = activitiesOperations
    .filter(op => op.operation === ACTIVITIES_OPERATIONS.cancel)
    .map(op => op.activity);
  const activitiesToUpdate = activitiesOperations
    .filter(op => op.operation === ACTIVITIES_OPERATIONS.update)
    .map(op => op.activity);
  return (
    <Box>
      {activitiesToUpdate.length > 0 && (
        <Box data-qa="listActivitiesToUpdate">
          <Typography>
            Les horaires des activités suivantes seront modifiés
          </Typography>
          <ActivityList
            activities={activitiesToUpdate}
            hideChart
            isMissionEnded
          />
        </Box>
      )}
      {activitiesToCancel.length > 0 && (
        <Box data-qa="listActivitiesToCancel">
          <Typography>Les activités suivantes seront supprimées</Typography>
          <ActivityList
            activities={activitiesToCancel}
            hideChart
            isMissionEnded
          />
        </Box>
      )}
    </Box>
  );
}
