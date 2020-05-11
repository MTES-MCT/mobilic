import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";
import Box from "@material-ui/core/Box";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import Typography from "@material-ui/core/Typography";
import { SHORT_MONTHS } from "common/utils/time";

const useStyles = makeStyles(theme => ({
  periodContainer: {
    borderRadius: "16px"
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
  }
}));

export function PeriodCarouselPicker({
  selectedPeriod,
  periods,
  onPeriodChange,
  renderPeriod
}) {
  const classes = useStyles();
  const baseRef = React.createRef();

  const selectedPeriodIdx = periods.findIndex(p => p === selectedPeriod);
  const periodRefs = {};
  periods.forEach(period => {
    periodRefs[period] = React.createRef();
  });

  const scrollToSelectedPeriod = period => {
    if (period && periodRefs[period]) {
      periodRefs[period].current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "center"
      });
    }
  };

  // Since we want the current selected period to be always visually scrolled to, adding a scrollIntoView in the period click handler is not enough.,
  // because the period can be modified by other sources than the user click :
  // - on loading data from the backend or local storage
  // - when user changes tab (from day to week for instance), this alters both the selected item and the item list in the carousel

  // The following effect is intended to handle all these secondary cases. It relies on the following (hacky) heuristics :
  // - all these cases can be identified by a change of the whole list of items.
  // - furthermore a change in the list always modifies its length
  // Therefore we allow the effect to run only if the new list has a different length than the previous one
  // We access the previous list using the tip from https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state

  const previousPeriodsRef = React.useRef();
  const previousPeriods = previousPeriodsRef.current;

  React.useEffect(() => {
    if (
      periods &&
      (!previousPeriods || previousPeriods.length !== periods.length)
    ) {
      console.log("Scrolling from change other than user click");
      scrollToSelectedPeriod(selectedPeriod);
    }
    previousPeriodsRef.current = periods;
  }, [periods, selectedPeriod]);

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
        <Box
          ref={baseRef}
          py={1}
          mx={1}
          className={`flex-row ${classes.carousel}`}
        >
          {periods.map(period => {
            const periodDate = new Date(period);
            return (
              <Box
                p={1}
                ref={periodRefs[period]}
                key={period}
                className={`${classes.periodContainer} ${period ===
                  selectedPeriod && classes.selectedPeriod}`}
                onClick={() => {
                  onPeriodChange(period);
                  scrollToSelectedPeriod(period);
                }}
              >
                {renderPeriod ? (
                  renderPeriod(period)
                ) : (
                  <Box className="flex-column-space-between">
                    <Typography variant="h5">{periodDate.getDate()}</Typography>
                    <Typography>
                      {SHORT_MONTHS[periodDate.getMonth()]}
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
