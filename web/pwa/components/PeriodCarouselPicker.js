import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";
import Box from "@material-ui/core/Box";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import Typography from "@material-ui/core/Typography";
import { formatDayOfWeek, shortPrettyFormatDay } from "common/utils/time";

const useStyles = makeStyles(theme => ({
  periodContainer: {
    borderRadius: "16px",
    position: "relative",
    whiteSpace: "nowrap"
  },
  selectedPeriod: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  carousel: {
    overflowX: "auto",
    borderRadius: "16px",
    scrollBehavior: "smooth",
    flexGrow: 1
  },
  fadingEdge: {
    position: "absolute",
    top: 0,
    bottom: 0,
    height: "100%",
    width: 60,
    pointerEvents: "none"
  },
  rightFadingEdge: {
    right: 0,
    background:
      "linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9) 100%)"
  },
  leftFadingEdge: {
    left: 0,
    background:
      "linear-gradient(to left, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9) 100%)"
  },
  periodChip: {
    position: "absolute",
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
    height: theme.spacing(1),
    width: theme.spacing(1),
    borderRadius: "50%"
  },
  selectedPeriodChip: {
    backgroundColor: theme.palette.primary.contrastText
  },
  orangeChip: {
    backgroundColor: theme.palette.warning.main
  }
}));

export function PeriodCarouselPicker({
  selectedPeriod,
  periods,
  shouldDisplayPeriodsInBold = {},
  shouldDisplayRedChipsForPeriods,
  shouldDisplayOrangeChipsForPeriods,
  onPeriodChange,
  renderPeriod,
  periodMissionsGetter = () => {}
}) {
  const classes = useStyles();

  const periodRef = React.createRef();

  const selectedPeriodIdx = periods.findIndex(p => p === selectedPeriod);

  const scrollToSelectedPeriod = () => {
    if (periodRef.current) {
      periodRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  };

  React.useEffect(() => {
    if (periods) {
      scrollToSelectedPeriod();
    }
  }, [periods.length, selectedPeriod]);

  return (
    <Box style={{ position: "relative" }}>
      <Box className="flex-row-center full-width">
        <Box
          className={`${selectedPeriodIdx === 0 && "hidden"}`}
          onClick={() =>
            selectedPeriodIdx > 0 &&
            onPeriodChange(periods[selectedPeriodIdx - 1])
          }
        >
          <ArrowLeftIcon />
        </Box>
        <Box py={1} mx={1} className={`flex-row ${classes.carousel}`}>
          {periods.map(period => {
            return (
              <Box
                p={1}
                px={2}
                ref={period === selectedPeriod ? periodRef : null}
                key={period}
                className={`${classes.periodContainer} ${period ===
                  selectedPeriod && classes.selectedPeriod}`}
                onClick={() => {
                  onPeriodChange(period);
                }}
              >
                {shouldDisplayRedChipsForPeriods &&
                shouldDisplayRedChipsForPeriods[period.toString()] ? (
                  <Box className={`${classes.periodChip}`} />
                ) : shouldDisplayOrangeChipsForPeriods &&
                  shouldDisplayOrangeChipsForPeriods[period.toString()] ? (
                  <Box
                    className={`${classes.periodChip} ${classes.orangeChip}`}
                  />
                ) : null}
                {renderPeriod ? (
                  renderPeriod(period, periodMissionsGetter(period))
                ) : (
                  <Box className="flex-column-space-between">
                    <Typography
                      className={
                        shouldDisplayPeriodsInBold[period] ? "bold" : ""
                      }
                      style={{ textTransform: "uppercase" }}
                    >
                      {formatDayOfWeek(period)}
                    </Typography>
                    <Typography
                      className={
                        shouldDisplayPeriodsInBold[period] ? "bold" : ""
                      }
                    >
                      {shortPrettyFormatDay(period)}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
        <Box
          className={`${selectedPeriodIdx === periods.length - 1 && "hidden"}`}
          onClick={() =>
            selectedPeriodIdx < periods.length - 1 &&
            onPeriodChange(periods[selectedPeriodIdx + 1])
          }
        >
          <ArrowRightIcon />
        </Box>
      </Box>
      <Box className={`${classes.fadingEdge} ${classes.leftFadingEdge}`} />
      <Box className={`${classes.fadingEdge} ${classes.rightFadingEdge}`} />
    </Box>
  );
}
