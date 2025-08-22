import { makeStyles } from "@mui/styles";

export const useWarningModificationMissionStyles = makeStyles(theme => ({
  validationWarningIcon: {
    minWidth: theme.spacing(4)
  },
  modificationWarningItem: {
    alignItems: "baseline",
    fontStyle: "italic",
    padding: 0
  },
  dismissModificationAlert: {
    float: "right",
    fontStyle: "italic",
    fontSize: "0.75rem"
  }
}));
