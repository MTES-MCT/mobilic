import React from "react";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";

function getCdnUrl(id) {
  return `https://player.vimeo.com/video/${id}?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479`;
}

export function VideoCard({ id, title, description, ...props }) {
  const classes = resourceCardsClasses();

  return (
    <Card variant="outlined" className={classes.card} {...props}>
      <Typography variant={"h5"} className={classes.description}>
        {description}
      </Typography>
      <div style={{ padding: "20rem 0 0 0", position: "relative" }}>
        <iframe
          src={getCdnUrl(id)}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%"
          }}
          title={title}
        ></iframe>
      </div>
    </Card>
  );
}
