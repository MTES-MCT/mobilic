import Box from "@material-ui/core/Box";
import { ACTIVITIES } from "common/utils/activities";
import React from "react";
import { formatTimeOfDay } from "common/utils/time";
import useTheme from "@material-ui/core/styles/useTheme";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { getTime } from "common/utils/events";
import { formatPersonName, getCoworkerById } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

function ActivityStepButton({ activity, onClick }) {
  const theme = useTheme();
  return (
    <Button
      style={{
        margin: "0px 8px",
        padding: 0,
        width: 64,
        height: 64,
        display: "flex",
        borderRadius: "50%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.palette[activity.name],
        color: "#fff"
      }}
      onClick={onClick}
    >
      {activity.renderIcon()}
    </Button>
  );
}

export function VerticalTimeline({ activityEvents, handleEventClick }) {
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const theme = useTheme();
  return (
    <Box p={3} className="scrollable">
      {activityEvents.map((activityEvent, index) => {
        let driverInfo = "";
        if (
          activityEvent.type === ACTIVITIES.drive.name &&
          activityEvent.driverId
        ) {
          driverInfo = `Conducteur : ${formatPersonName(
            activityEvent.driverId === storeSyncedWithLocalStorage.userId()
              ? storeSyncedWithLocalStorage.userInfo()
              : getCoworkerById(
                  activityEvent.driverId,
                  storeSyncedWithLocalStorage.coworkers()
                )
          )}`;
        }
        return [
          <Box
            key={2 * index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Box
              style={{ textAlign: "right" }}
              className="vertical-timeline-label new-lines-on-overflow"
            >
              <Typography>{formatTimeOfDay(getTime(activityEvent))}</Typography>
            </Box>
            <ActivityStepButton
              activity={ACTIVITIES[activityEvent.type]}
              onClick={() => handleEventClick(activityEvent)}
            />
            <Box
              style={{ textAlign: "left" }}
              className="vertical-timeline-label new-lines-on-overflow"
            >
              <Typography>{driverInfo}</Typography>
            </Box>
          </Box>,
          <Box
            key={2 * index + 1}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Box
              style={{
                width: 3,
                background:
                  index < activityEvents.length - 1
                    ? theme.palette[activityEvent.type]
                    : `linear-gradient(to bottom, ${
                        theme.palette[activityEvent.type]
                      }, white)`,
                border: 0,
                borderRadius: 1,
                height: activityEvent.type !== ACTIVITIES.rest.name ? 60 : 0
              }}
            />
          </Box>
        ];
      })}
    </Box>
  );
}
