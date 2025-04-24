import { makeStyles } from "@mui/styles";
import React from "react";
import Box from "@mui/material/Box";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Typography from "@mui/material/Typography";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  periodContainer: {
    position: "relative",
    whiteSpace: "nowrap"
  },
  selectedPeriod: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  periodBottom: {
    color: fr.colors.decisions.text.mention.grey.default
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
  periodStatuses,
  onPeriodChange,
  getTitle,
  getSubtitle,
  renderChip,
  periodMissionsGetter = () => {}
}) {
  const classes = useStyles();

  const periodRef = React.createRef();
  const [selectedPeriodIdx, setSelectedPeriodIdx] = React.useState(0);

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
    setSelectedPeriodIdx(periods.findIndex(p => p === selectedPeriod));
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
            const periodStatus = periodStatuses[period.toString()];
            const missions = periodMissionsGetter(period);
            const isPeriodSelected = period === selectedPeriod;
            const title = getTitle(period, missions);
            const subtitle = getSubtitle(period, missions);
            const chip = renderChip
              ? renderChip(periodStatus, isPeriodSelected)
              : null;
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
                <Box
                  className="flex-column-space-between"
                  sx={{
                    maxWidth: "140px"
                  }}
                >
                  <Typography>
                    {title}
                    {chip && `  `}
                    {chip}
                  </Typography>
                  <Typography
                    className={`${!isPeriodSelected && classes.periodBottom}`}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%"
                    }}
                  >
                    {subtitle}
                  </Typography>
                </Box>
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
