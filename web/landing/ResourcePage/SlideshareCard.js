import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { Card } from "@material-ui/core";
import { Link } from "../../common/LinkButton";

const useStyles = makeStyles(theme => ({
  slideshareCard: {
    borderRadius: 10,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.main,
    height: "100%"
  },
  description: {
    marginBottom: theme.spacing(3)
  },
  downloadLink: {
    color: theme.palette.primary.main,
    paddingLeft: theme.spacing(2)
  }
}));

export function SlideshareCard({
  slideshareUrl,
  description,
  downloadLink,
  customHeight
}) {
  const classes = useStyles();

  return (
    <Card variant="outlined" className={classes.slideshareCard}>
      <Typography variant={"h4"} className={classes.description}>
        {description}
        <Link className={classes.downloadLink} href={downloadLink}>
          Télécharger
        </Link>
      </Typography>
      <iframe
        src={slideshareUrl}
        width="100%"
        height={customHeight || "356"}
        title="Documentation Mobilic"
        frameBorder="0"
        marginWidth="0"
        marginHeight="0"
        scrolling="no"
        allowFullScreen
      />
    </Card>
  );
}
