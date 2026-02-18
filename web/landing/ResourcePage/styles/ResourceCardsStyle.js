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
  pressCard: {
    height: "100%",
    marginRight: theme.spacing(2),
  },
  pressImage: {
    maxHeight: 60,
    maxWidth: 230,
    marginBottom: theme.spacing(2),
  },
  testimonialImage: {
    maxHeight: 90,
    marginBottom: theme.spacing(2),
    objectFit: "contain"
  },
  testimonialSentence: {
    marginBottom: theme.spacing(4),
    textAlign: "left"
  },
  testimonialAuthor: {
    textAlign: "left"
  }
}));
