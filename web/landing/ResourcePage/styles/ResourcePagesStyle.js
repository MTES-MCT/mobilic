import { makeStyles } from "@mui/styles";

export const resourcePagesClasses = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingX: theme.spacing(5),
    margin: 0,
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(3),
      paddingX: theme.spacing(1),
      marginBottom: theme.spacing(4)
    }
  },
  inner: {
    margin: "auto",
    padding: 0,
    textAlign: "left"
  },
  title: {
    marginBottom: theme.spacing(6),
    maxWidth: 800,
    margin: "auto"
  },
  resourceSubtitle: {
    marginBottom: theme.spacing(3)
  },
  itAgentResourceSubtitle: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(3)
  },
  viewAllButton: {
    float: "right",
    marginTop: theme.spacing(2)
  }
}));
