import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(theme => ({
  title: {
    textAlign: "left",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center"
  },
  explanation: {
    marginBottom: theme.spacing(2),
    fontStyle: "italic",
    textAlign: "justify"
  },
  container: {
    padding: theme.spacing(2),
    flexShrink: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflowY: "hidden"
  },
  subPanel: {
    padding: theme.spacing(2)
  },
  successText: {
    color: theme.palette.success.main
  },
  warningText: {
    color: theme.palette.warning.main
  },
  virtualizedTableContainer: {
    maxHeight: "100%",
    flexShrink: 1,
    overflowY: "hidden"
  },
  collapseWrapper: {
    maxHeight: "100%"
  },
  missionModal: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  header: {
    "&:hover": {
      cursor: "inherit !important"
    }
  },
  tab: {
    maxWidth: 400
  },
  tabWithBadge: {
    maxWidth: 400,
    paddingRight: theme.spacing(4)
  },
  tabContainer: {
    marginBottom: theme.spacing(2)
  },
  customBadge: {
    "& .MuiBadge-badge": {
      right: theme.spacing(-2),
      top: theme.spacing(1),
      color: "white"
    }
  },
  validatedRow: {
    backgroundColor: theme.palette.success.light,
    "&:hover": {
      backgroundColor: theme.palette.success.light
    }
  },
  selectedRow: {
    background: theme.palette.primary.lighter
  },
  missionTitle: {
    textTransform: "uppercase",
    color: theme.palette.primary.main
  },
  companyName: {
    fontSize: "100%",
    fontWeight: "normal",
    textTransform: "none",
    color: theme.palette.grey[500]
  },
  companyFilter: {
    alignSelf: "flex-start",
    maxWidth: 400
  }
}));
