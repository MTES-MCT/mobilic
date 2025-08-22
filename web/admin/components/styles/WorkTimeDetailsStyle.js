import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(theme => ({
  employeeName: {
    textOverflow: "ellipsis"
  },
  regulatoryAlertCard: {
    height: "100%"
  },
  cardRecapKPI: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    flexDirection: "column"
  },
  cardRecapKPIContainer: {
    flexGrow: 1
  },
  amplitudeText: {
    marginTop: theme.spacing(1),
    fontSize: "1.75em"
  },
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  workTimeDetailsTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  closeButton: {
    padding: 0
  },
  workTimeDetailsTitle: {
    textOverflow: "ellipsis",
    marginRight: theme.spacing(4)
  },
  listActivitiesAccordion: {
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
      borderBottom: 0
    },
    "&:before": {
      display: "none"
    }
  },
  runningMissionText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  }
}));
