import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ActivityList } from "../ActivityList";
import { ACTIVITIES_OPERATIONS } from "common/utils/activities";

export default function OverlappedActivityList({ activitiesOperations }) {
  const activitiesToCancel = activitiesOperations
    .filter(op => op.operation === ACTIVITIES_OPERATIONS.cancel)
    .map(op => {
      return {
        ...op.activity,
        operation: {
          type: ACTIVITIES_OPERATIONS.cancel
        }
      };
    });
  const activitiesToUpdate = activitiesOperations
    .filter(op => op.operation === ACTIVITIES_OPERATIONS.update)
    .map(op => {
      return {
        ...op.activity,
        operation: {
          type: op.operation,
          startTime: op.startTime,
          endTime: op.endTime
        }
      };
    });
  const activitiesToCreate = activitiesOperations.filter(
    op => op.operation === ACTIVITIES_OPERATIONS.create
  );
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
      {activitiesToCreate.length > 0 && (
        <Box data-qa="listActivitiesToCreate">
          <Typography>L'activité suivante sera créée</Typography>
          <ActivityList
            activities={activitiesToCreate}
            hideChart
            isMissionEnded
          />
        </Box>
      )}
    </Box>
  );
}
