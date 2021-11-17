import makeStyles from "@material-ui/core/styles/makeStyles";

export const useActivitiesCardStyles = makeStyles(theme => ({
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
    display: "block",
    overflowX: "auto",
    padding: theme.spacing(2),
    borderTop: "1px solid rgba(0, 0, 0, .125)"
  },
  activitiesTableContainer: {
    width: "100%"
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
