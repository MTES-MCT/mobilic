import makeStyles from "@material-ui/core/styles/makeStyles";

export const resourceCardsClasses = makeStyles(theme => ({
  card: {
    borderRadius: 10,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.main,
    width: "100%",
    height: "100%"
  },
  description: {
    marginBottom: theme.spacing(2)
  },
  linkWholeCard: {
    padding: 0,
    textTransform: "none",
    height: "100%",
    width: "100%",
    "& .MuiButton-label": {
      height: "100%"
    }
  }
}));
