import { makeStyles } from "@mui/styles";

export const resourceCardsClasses = makeStyles(theme => ({
  card: {
    borderRadius: 10,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.main,
    width: "100%",
    height: "100%",
    position: "relative"
  },
  description: {
    marginBottom: theme.spacing(2),
    textAlign: "center",
    fontSize: "1.125em"
  },
  linkWholeCard: {
    padding: 0,
    textTransform: "none",
    height: "100%",
    width: "100%"
  },
  smallPressCard: {
    marginRight: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  pressCard: {
    height: "100%",
    marginRight: theme.spacing(2),
    padding: theme.spacing(3),
    paddingTop: theme.spacing(4),
  },
  pressImage: {
    height: 120,
    width: "100%",
    objectFit: "contain",
    padding: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: 100,
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: 80,
    },
  },
  testimonialImage: {
    maxHeight: 90,
    marginBottom: theme.spacing(2),
    objectFit: "contain"
  },
  testimonialSentence: {
    marginBottom: theme.spacing(2),
    textAlign: "left",
  },
  testimonialAuthor: {
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
    textAlign: "left",
  },
}));
