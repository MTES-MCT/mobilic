import { makeStyles } from "@mui/styles";

export const resourcePagesClasses = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    margin: 0
  },
  inner: {
    margin: "auto",
    padding: 0,
    textAlign: "left"
  },
  title: {
    marginBottom: theme.spacing(6),
    maxWidth: 600,
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
