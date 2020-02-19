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
import { isGraphQLParsingError } from "../../common/utils/errors";

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
    storeSyncedWithLocalStorage.pushNewExpenditure(
      expenditureType,
      team,
      async () => {
        const expendituresToSubmit = storeSyncedWithLocalStorage.expendituresPendingSubmission();
        try {
          const expendituresSubmit = await api.graphQlMutate(
            EXPENDITURE_LOG_MUTATION,
            { data: expendituresToSubmit }
          );
          const expenditures =
            expendituresSubmit.data.logExpenditures.expenditures;
          storeSyncedWithLocalStorage.setExpenditures(
            expenditures.map(parseExpenditureFromBackend)
          );
        } catch (err) {
          if (isGraphQLParsingError(err)) {
            storeSyncedWithLocalStorage.setExpenditures(
              storeSyncedWithLocalStorage
                .expenditures()
                .filter(
                  expenditure =>
                    !expendituresToSubmit
                      .map(e => e.eventTime)
                      .includes(expenditure.eventTime)
                )
            );
          }
        }
      }
    );
  };

  return (
    <Container className="app-container space-between">
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
