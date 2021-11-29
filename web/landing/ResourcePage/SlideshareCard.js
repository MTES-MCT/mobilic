import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { Card } from "@material-ui/core";
import { Link } from "../../common/LinkButton";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";

const useStyles = makeStyles(theme => ({
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
  const commonCardsClasses = resourceCardsClasses();

  return (
    <Card variant="outlined" className={commonCardsClasses.card}>
      <Typography variant={"h4"} className={commonCardsClasses.description}>
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
