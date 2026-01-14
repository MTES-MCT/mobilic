import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4)
  },
  cardRecapKPI: {
    flex: 1,
    display: "flex",
    minHeight: "144px",
    justifyContent: "center",
    flexDirection: "column"
  },
  amplitudeText: {
    marginTop: theme.spacing(1),
    fontSize: "1.75em"
  },
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  closeButton: {
    padding: 0
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
