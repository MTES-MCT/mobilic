import React from "react";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";

export function VideoCard({ youtubeUrl, description }) {
  const classes = resourceCardsClasses();

  return (
    <Card variant="outlined" className={classes.card}>
      <Typography variant={"h4"} className={classes.description}>
        {description}
      </Typography>
      <iframe
        width="100%"
        height="356"
        src={youtubeUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Card>
  );
}
