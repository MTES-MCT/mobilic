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
    padding: theme.spacing(2),
    height: "50%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column"
  },
  cardRecapAmplitude: {
    marginBottom: theme.spacing(3)
  },
  amplitudeText: {
    marginTop: theme.spacing(1),
    fontSize: "1.75em"
  },
  cardLegalThreshold: {
    textAlign: "left",
    height: `calc(100% + ${theme.spacing(3)}px)`,
    padding: theme.spacing(2)
  },
  cardExpenditures: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    overflow: "revert"
  },
  legalInfoTitle: {
    paddingBottom: theme.spacing(2)
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
    overflow: "visible",
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
      borderBottom: 0
    },
    "&:before": {
      display: "none"
    }
  },
  listActivitiesAccordionSummary: {
    backgroundColor: "rgba(0, 0, 0, .03)",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)"
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1)
    }
  },
  listActivitiesAccordionDetail: {
    overflowY: "scroll",
    padding: theme.spacing(2),
    borderTop: "1px solid rgba(0, 0, 0, .125)"
  }
}));
