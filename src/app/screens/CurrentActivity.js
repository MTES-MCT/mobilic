import React from "react";
import { TimeLine } from "../../common/components/Timeline";
import { ActivitySwitchGrid } from "../../common/components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import { computeTotalActivityDurations } from "../../common/utils/metrics";
import Typography from "@material-ui/core/Typography";
import { Expenditures } from "../../common/components/Expenditures";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/storage";

export function CurrentActivity({
  currentActivityType,
  currentDayActivityEvents,
  teamMates,
  currentDayExpenditures
}) {
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const timers = computeTotalActivityDurations(
    currentDayActivityEvents,
    Date.now() + 1
  );
  return (
    <Container className="container space-between">
      <TimeLine dayEvents={currentDayActivityEvents} />
      <Divider className="full-width-divider" />
      {teamMates.length > 0 && [
        <Typography
          key={1}
          variant="subtitle1"
          className="current-team-summary"
          noWrap
        >
          {teamMates.length} coéquipier{teamMates.length > 1 && "s"} :{" "}
          {teamMates.map(mate => mate.firstName).join(", ")}
        </Typography>,
        <Divider key={2} className="full-width-divider" />
      ]}
      <ActivitySwitchGrid
        timers={timers}
        activityOnFocus={currentActivityType}
        pushActivitySwitchEvent={type =>
          storeSyncedWithLocalStorage.pushNewActivity(type, teamMates)
        }
      />
      <Divider className="full-width-divider" />
      <Expenditures
        expenditures={currentDayExpenditures}
        pushNewExpenditure={storeSyncedWithLocalStorage.pushNewExpenditure}
      />
    </Container>
  );
}
