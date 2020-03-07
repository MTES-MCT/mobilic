import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { formatTimeOfDay } from "../utils/time";
import classNames from "classnames";
import { ACTIVITIES } from "../utils/activities";
import Typography from "@material-ui/core/Typography";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import useTheme from "@material-ui/core/styles/useTheme";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { ModalContext } from "../utils/modals";
import EditIcon from "@material-ui/icons/Edit";
import { WorkDayRevision } from "../../app/components/ActivityRevision";
import { getTime } from "../utils/events";

const useStyles = makeStyles({
  period: props => ({
    width: props.width,
    backgroundColor: props.color
  }),
  point: props => ({
    height: props.height
  })
});

function Period({ width, color, className, children = null }) {
  const classes = useStyles({ width, color });
  return (
    <div
      className={classNames(
        "timeline-segment",
        "flexbox-center",
        classes.period,
        className
      )}
    >
      {children}
    </div>
  );
}

function Event({ height, className, children = null }) {
  const classes = useStyles({ height });
  return (
    <div
      className={classNames(
        "timeline-point",
        "flexbox-center",
        classes.point,
        className
      )}
    >
      {children}
    </div>
  );
}

export function TimeLine({ dayActivityEvents, cancelOrReviseActivityEvent }) {
  const theme = useTheme();
  const [openRevisionModal, setOpenRevisionModal] = React.useState(false);

  const lastActivityEvent = dayActivityEvents[dayActivityEvents.length - 1];
  const endDate =
    lastActivityEvent.type === ACTIVITIES.rest.name
      ? getTime(lastActivityEvent)
      : null;
  const eventsToDisplay = endDate
    ? dayActivityEvents.slice(0, dayActivityEvents.length - 1)
    : dayActivityEvents;

  const periodWidth = `${Math.floor(
    (100 - eventsToDisplay.length) / eventsToDisplay.length
  )}%`;
  return (
    <>
      <div className="timeline-container">
        <Box mb={1} className="flexbox-space-between full-width">
          <Typography variant="h6" className="bold">
            Évènements du jour
          </Typography>
          {cancelOrReviseActivityEvent && (
            <IconButton
              color="primary"
              onClick={() => setOpenRevisionModal(true)}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
        <div className="timeline-line flexbox-center">
          {eventsToDisplay.map((event, index) => (
            <React.Fragment key={index}>
              <Event className="timeline-legend hidden" />
              <Period width={periodWidth} className="timeline-legend">
                {ACTIVITIES[event.type].renderIcon({
                  style: {
                    color:
                      index === eventsToDisplay.length - 1 && !endDate
                        ? theme.palette.primary.main
                        : theme.palette[event.type]
                  }
                })}
              </Period>
              {index === eventsToDisplay.length - 1 &&
                (endDate ? (
                  <Event className="timeline-legend hidden" />
                ) : (
                  <ChevronRightOutlinedIcon
                    fontSize="small"
                    color="primary"
                    className="timeline-line-end-arrow hidden"
                  />
                ))}
            </React.Fragment>
          ))}
        </div>
        <div className="timeline-line flexbox-center">
          {eventsToDisplay.map((event, index) => (
            <React.Fragment key={index}>
              <Event />
              <Period
                width={periodWidth}
                color={theme.palette[event.type]}
                className={
                  index === eventsToDisplay.length - 1 &&
                  !endDate &&
                  "timeline-segment-blurred"
                }
              />
              {index === eventsToDisplay.length - 1 &&
                (endDate ? (
                  <Event />
                ) : (
                  <ChevronRightOutlinedIcon
                    fontSize="small"
                    color="primary"
                    className="timeline-line-end-arrow"
                  />
                ))}
            </React.Fragment>
          ))}
        </div>
        <div className="timeline-line flexbox-center">
          {eventsToDisplay.map((event, index) => (
            <React.Fragment key={index}>
              <Event className="timeline-legend">
                <Typography variant="caption" className="timeline-legend-label">
                  {formatTimeOfDay(getTime(event))}
                </Typography>
              </Event>
              <Period width={periodWidth} className="timeline-legend" />
              {index === eventsToDisplay.length - 1 &&
                (endDate ? (
                  <Event className="timeline-legend">
                    <Typography
                      variant="caption"
                      className="timeline-legend-label"
                    >
                      {formatTimeOfDay(endDate)}
                    </Typography>
                  </Event>
                ) : (
                  <ChevronRightOutlinedIcon
                    fontSize="small"
                    color="primary"
                    className="timeline-line-end-arrow hidden"
                  />
                ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <WorkDayRevision
        open={openRevisionModal}
        handleClose={() => setOpenRevisionModal(false)}
        handleActivityRevision={cancelOrReviseActivityEvent}
        activityEvents={dayActivityEvents}
      />
    </>
  );
}
