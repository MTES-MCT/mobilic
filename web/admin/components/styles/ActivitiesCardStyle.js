import makeStyles from "@material-ui/core/styles/makeStyles";

export const useActivitiesCardStyles = makeStyles(theme => ({
  activitiesTableContainer: {
    width: "100%",
    maxHeight: 450,
    overflow: "auto"
  },
  listActivitiesGrid: {
    marginBottom: theme.spacing(5)
  },
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  chartContainer: {
    textAlign: "center"
  },
  addActivityButton: {
    float: "right"
  }
}));
