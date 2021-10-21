import makeStyles from "@material-ui/core/styles/makeStyles";

export const useStyles = makeStyles(theme => ({
  workTimeTitle: {
    textOverflow: "ellipsis",
    marginRight: theme.spacing(4)
  },
  employeeName: {
    textOverflow: "ellipsis",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(6)
  },
  workTimeRecapCards: {
    textAlign: "center",
    paddingBottom: theme.spacing(2)
  },
  cardRecapKPI: {
    textAlign: "center",
    padding: theme.spacing(2)
  },
  cardRecapAmplitude: {
    marginBottom: theme.spacing(3)
  },
  amplitudeText: {
    fontSize: "1.75em"
  },
  cardLegalThreshold: {
    textAlign: "left",
    height: "100%",
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2)
  },
  cardExpenditures: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    overflow: "revert"
  },
  expendituresTitle: {
    paddingBottom: theme.spacing(2)
  },
  chipExpenditure: {
    marginRight: theme.spacing(2)
  },
  activitiesTitle: {
    paddingBottom: theme.spacing(4)
  },
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));
