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
  cardRecapAmplitude: {
    marginBottom: theme.spacing(2)
  },
  amplitudeText: {
    marginTop: theme.spacing(1),
    fontSize: "1.75em"
  },
  cardTitlePadding: {
    paddingBottom: theme.spacing(2)
  },
  chipExpenditure: {
    marginRight: theme.spacing(2)
  },
  cardTitleLongPadding: {
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
    overflowX: "auto",
    padding: theme.spacing(2),
    borderTop: "1px solid rgba(0, 0, 0, .125)"
  },
  noExpenditureLabel: {
    color: theme.palette.grey[500],
    fontStyle: "italic"
  },
  activitiesTableContainer: {
    width: "100%"
  }
}));
