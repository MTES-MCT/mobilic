import React from "react";
import uniq from "lodash/uniq";
import { HOUR } from "../utils/time";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { ACTIVITIES } from "../utils/activities";

const ORDERED_SCALES_IN_HOURS = [0.5, 1, 2, 3, 4, 6, 12, 24];

const HEIGHT_FOR_ICON_HEADER = 60;

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2),
    position: "relative"
  },
  gridContainer: {
    position: "absolute",
    top: HEIGHT_FOR_ICON_HEADER
  },
  yAxis: {
    width: 0,
    height: "100%",
    borderLeft: "solid 1px",
    position: "absolute"
  },
  yAxisMark: {
    height: 0,
    position: "absolute",
    width: "100%"
  },
  yAxisMajorMark: {
    borderBottom: `solid 1px ${theme.palette.grey[300]}`
  },
  yAxisMinorMark: {
    borderBottom: `dashed 1px ${theme.palette.grey[300]}`
  }
}));

export function VerticalTimeline({
  width,
  activities,
  maxWidth = null,
  maxInterBarWidth = 30,
  minInterBarWidth = 20,
  yAxisWidth = 50,
  minYAxisStepHeight = 50,
  maxSteps = 10,
  heightTarget = 300,
  maxBarWidth = 40,
  idealNumberOfSteps = 5,
  datetimeFormatter
}) {
  const classes = useStyles();

  const filteredActivities = activities.filter(a => a.duration > 0);
  if (filteredActivities.length === 0) return null;

  const activityTypes = uniq(filteredActivities.map(a => a.type));
  const nColumns = activityTypes.length;

  const xOffsets = {};
  activityTypes.forEach((key, index) => {
    xOffsets[key] = index;
  });

  const empiricalMaxWidth =
    yAxisWidth + nColumns * (maxInterBarWidth + maxBarWidth);

  const actualWidth = maxWidth
    ? Math.min(maxWidth, width - 15, empiricalMaxWidth)
    : Math.min(width - 15, empiricalMaxWidth);
  const missingWidth = width - actualWidth;

  const barPlusInterBarWidth = (actualWidth - yAxisWidth) / nColumns;
  const interBarWidth =
    barPlusInterBarWidth >= maxInterBarWidth * 3
      ? maxInterBarWidth
      : minInterBarWidth;
  const barWidth = barPlusInterBarWidth - interBarWidth;

  const startHour = (filteredActivities[0].displayedStartTime / HOUR) >> 0;
  const endHour =
    ((filteredActivities[filteredActivities.length - 1].endTimeOrNow / HOUR) >>
      0) +
    1;

  const totalHoursSpanned = endHour - startHour + 1;

  if (
    totalHoursSpanned / maxSteps >
    ORDERED_SCALES_IN_HOURS[ORDERED_SCALES_IN_HOURS.length - 1]
  )
    return (
      <Typography>
        La période de temps est trop large pour être visualisée sur une frise
      </Typography>
    );

  const idealStepSize = (totalHoursSpanned / idealNumberOfSteps) >> 0;
  let stepSize = ORDERED_SCALES_IN_HOURS.find(s => s > idealStepSize);
  if (stepSize) {
    const index = ORDERED_SCALES_IN_HOURS.indexOf(stepSize);
    stepSize = ORDERED_SCALES_IN_HOURS[index > 0 ? index - 1 : 0];
  } else stepSize = ORDERED_SCALES_IN_HOURS[ORDERED_SCALES_IN_HOURS.length - 1];
  const subStepSize = stepSize === 3 ? 1 : stepSize / 2;

  const actualSteps = totalHoursSpanned / stepSize;
  const yAxisStepHeight = Math.max(
    heightTarget / actualSteps,
    minYAxisStepHeight
  );
  const height = actualSteps * yAxisStepHeight;

  const subStepDuration = HOUR * subStepSize;
  const startOfDatetimeAxis =
    filteredActivities[0].displayedStartTime - subStepDuration / 2;
  const endOfDatetimeAxis =
    filteredActivities[filteredActivities.length - 1].endTimeOrNow +
    subStepDuration / 2;
  const firstSubStep = ((startOfDatetimeAxis / subStepDuration) >> 0) + 1;
  const lastSubStep = Math.max(
    (endOfDatetimeAxis / subStepDuration) >> 0,
    firstSubStep
  );

  function getYOffsetForTime(time) {
    return (
      ((time - startOfDatetimeAxis) /
        (endOfDatetimeAxis - startOfDatetimeAxis)) *
      height
    );
  }

  function getXOffsetForActivity(type) {
    return xOffsets[type] * barPlusInterBarWidth + interBarWidth;
  }

  const subSteps = [];
  let currentSubStep = firstSubStep;
  while (currentSubStep <= lastSubStep) {
    subSteps.push(currentSubStep);
    currentSubStep = currentSubStep + 1;
  }

  return (
    <Box
      className={classes.container}
      style={{
        width: actualWidth + 15,
        height: height + HEIGHT_FOR_ICON_HEADER,
        marginLeft:
          missingWidth > yAxisWidth ? (missingWidth - yAxisWidth) / 2 : "auto",
        marginRight:
          missingWidth > yAxisWidth
            ? (missingWidth - yAxisWidth) / 2 + yAxisWidth
            : "auto"
      }}
    >
      <Box
        style={{
          position: "absolute",
          height: HEIGHT_FOR_ICON_HEADER,
          width: "100%"
        }}
      >
        {activityTypes.map(type => (
          <Box
            key={type}
            style={{
              position: "absolute",
              left: getXOffsetForActivity(type) + yAxisWidth,
              width: barWidth,
              height: HEIGHT_FOR_ICON_HEADER
            }}
          >
            <Box
              style={{
                margin: "auto",
                display: "flex",
                height: 32,
                width: 32,
                borderRadius: "50%",
                backgroundColor: ACTIVITIES[type].color
              }}
            >
              {ACTIVITIES[type].renderIcon({
                style: { color: "white", margin: "auto" }
              })}
            </Box>
            <Typography
              align="center"
              style={{ display: "block" }}
              noWrap
              variant="caption"
            >
              {ACTIVITIES[type].label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        className={classes.gridContainer}
        style={{
          height,
          width: actualWidth + 15 - yAxisWidth,
          left: yAxisWidth
        }}
      >
        {subSteps.map(h => (
          <Box
            key={h}
            className={`${classes.yAxisMark} ${
              (h * subStepSize) % stepSize === 0
                ? classes.yAxisMajorMark
                : classes.yAxisMinorMark
            }`}
            style={{ top: getYOffsetForTime(h * subStepDuration) }}
          />
        ))}
        <Box className={classes.yAxis} />
        {subSteps
          .filter(h => (h * subStepSize) % stepSize === 0)
          .map(h => [
            <Typography
              key={`text${h}`}
              align="left"
              variant="caption"
              color="textSecondary"
              style={{
                position: "absolute",
                top: getYOffsetForTime(h * subStepDuration) - 8,
                left: -yAxisWidth,
                width: yAxisWidth - 4
              }}
            >
              {datetimeFormatter(h * subStepDuration)}
            </Typography>,
            <Box
              key={`mark${h}`}
              style={{
                position: "absolute",
                height: 0,
                width: 4,
                borderBottom: "solid 1px",
                top: getYOffsetForTime(h * subStepDuration),
                left: -2
              }}
            />
          ])}
        {filteredActivities.map((a, index) => {
          let topOffset = getYOffsetForTime(a.displayedStartTime);
          let rectHeight = getYOffsetForTime(a.endTimeOrNow) - topOffset;
          if (rectHeight <= 4) {
            rectHeight = 2;
            topOffset = topOffset - 1;
          } else {
            topOffset = topOffset + 1;
            rectHeight = rectHeight - 2;
          }
          const leftOffset = getXOffsetForActivity(a.type);
          return (
            <Box
              key={a.id || index}
              style={{
                marginTop: 1,
                marginBottom: 1,
                position: "absolute",
                display: "flex",
                top: topOffset,
                left: leftOffset,
                width: barWidth,
                height: rectHeight,
                backgroundColor: ACTIVITIES[a.type].color
              }}
            >
              {rectHeight > 20 && barWidth > 20
                ? ACTIVITIES[a.type].renderIcon({
                    style: { color: "white", margin: "auto" },
                    fontSize: "small"
                  })
                : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
