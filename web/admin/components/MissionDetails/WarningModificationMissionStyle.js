import makeStyles from "@material-ui/core/styles/makeStyles";

export const useWarningModificationMissionStyles = makeStyles(theme => ({
  validationWarningIcon: {
    minWidth: theme.spacing(4)
  },
  modificationWarningItem: {
    alignItems: "baseline",
    fontStyle: "italic",
    padding: 0
  },
  modificationAlert: {
    marginBottom: theme.spacing(3),
    "& .MuiAlert-message": {
      width: "100%",
      paddingTop: theme.spacing(0.5)
    }
  },
  dismissModificationAlert: {
    float: "right",
    fontStyle: "italic",
    fontSize: "0.75rem"
  }
}));
