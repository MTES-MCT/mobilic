import React from "react";
import { TimeLine } from "../../common/components/Timeline";
import { ActivitySwitchGrid } from "../../common/components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import { computeTotalActivityDurations } from "../../common/utils/metrics";
import { Expenditures } from "../../common/components/Expenditures";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/store";
import { EXPENDITURE_LOG_MUTATION, useApi } from "../../common/utils/api";
import { parseExpenditureFromBackend } from "../../common/utils/expenditures";
import { resolveCurrentTeam } from "../../common/utils/coworkers";

export function CurrentActivity({
  currentActivity,
  currentDayActivityEvents,
  pushNewActivityEvent,
  currentDayExpenditures
}) {
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const api = useApi();

  const timers = computeTotalActivityDurations(
    currentDayActivityEvents,
    Date.now() + 1
  );

  const team = resolveCurrentTeam(currentActivity, storeSyncedWithLocalStorage);

  const pushNewExpenditure = expenditureType => {
    storeSyncedWithLocalStorage.pushNewExpenditure(expenditureType, team, () =>
      api.submitEvents(
        EXPENDITURE_LOG_MUTATION,
        "expenditures",
        apiResponse => {
          const expenditures = apiResponse.data.logExpenditures.expenditures;
          return storeSyncedWithLocalStorage.updateAllSubmittedEvents(
            expenditures.map(parseExpenditureFromBackend),
            "expenditures"
          );
        }
      )
    );
  };

  return (
    <Container className="app-container space-between" maxWidth={false}>
      <TimeLine dayEvents={currentDayActivityEvents} />
      <Divider className="full-width-divider" />
      <ActivitySwitchGrid
        timers={timers}
        team={team}
        currentActivity={currentActivity}
        pushActivitySwitchEvent={(activityType, driverIdx = null) =>
          pushNewActivityEvent({ activityType, team, driverIdx })
        }
      />
      <Divider className="full-width-divider" />
      <Expenditures
        expenditures={currentDayExpenditures}
        pushNewExpenditure={pushNewExpenditure}
      />
    </Container>
  );
}
