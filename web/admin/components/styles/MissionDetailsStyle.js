import makeStyles from "@material-ui/core/styles/makeStyles";

export const useMissionDetailsStyles = makeStyles(theme => ({
  closeButton: {
    padding: 0
  },
  missionSubTitle: {
    fontWeight: 200,
    display: "block"
  },
  validationSection: {
    textAlign: "center",
    paddingTop: theme.spacing(4)
  },
  comments: {
    paddingLeft: theme.spacing(3)
  },
  kilometers: {
    paddingBottom: theme.spacing(4)
  },
  vehicle: {
    flexShrink: 0,
    marginRight: theme.spacing(2)
  },
  employeeCard: {
    width: "100%"
  },
  noCommentText: {
    fontStyle: "italic",
    color: theme.palette.grey[500]
  },
  validationButton: {
    marginTop: theme.spacing(4)
  },
  adminValidation: {
    textAlign: "left"
  },
  runningMissionText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  }
}));
