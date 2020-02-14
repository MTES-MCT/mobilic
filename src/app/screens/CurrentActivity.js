import React from "react";
import { TimeLine } from "../../common/components/Timeline";
import { ActivitySwitchGrid } from "../../common/components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import { computeTotalActivityDurations } from "../../common/utils/metrics";
import Typography from "@material-ui/core/Typography";
import { Expenditures } from "../../common/components/Expenditures";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/store";
import { EXPENDITURE_LOG_MUTATION, useApi } from "../../common/utils/api";
import { parseExpenditureFromBackend } from "../../common/utils/expenditures";
import { getCoworkerById } from "../../common/utils/coworkers";

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

  const coworkers = storeSyncedWithLocalStorage.coworkers();
  const team = currentActivity.team.map(tm =>
    tm.id ? getCoworkerById(tm.id, coworkers) : tm
  );

  const pushNewExpenditure = expenditureType => {
    storeSyncedWithLocalStorage.pushNewExpenditure(
      expenditureType,
      team,
      async () => {
        try {
          const expendituresToSubmit = storeSyncedWithLocalStorage.expendituresPendingSubmission();
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
          console.log(err);
        }
      }
    );
  };

  return (
    <Container className="container space-between">
      <TimeLine dayEvents={currentDayActivityEvents} />
      <Divider className="full-width-divider" />
      {team.length > 1 && [
        <Typography
          key={1}
          variant="subtitle1"
          className="current-team-summary"
          noWrap
        >
          {team.length - 1} coéquipier{team.length > 2 && "s"} :{" "}
          {team
            .filter(tm => tm.id !== storeSyncedWithLocalStorage.userId())
            .map(mate => mate.firstName)
            .join(", ")}
        </Typography>,
        <Divider key={2} className="full-width-divider" />
      ]}
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
