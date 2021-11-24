import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { Card } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  videoCard: {
    borderRadius: 10,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.main,
    height: "100%"
  },
  description: {
    marginBottom: theme.spacing(2)
  }
}));

export function VideoCard({ youtubeUrl, description }) {
  const classes = useStyles();

  return (
    <Card variant="outlined" className={classes.videoCard}>
      <Typography variant={"h4"} className={classes.description}>
        {description}
      </Typography>
      <iframe
        width="100%"
        height="280"
        src={youtubeUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Card>
  );
}
