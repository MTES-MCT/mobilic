import React from "react";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { PLAY_VIDEO } from "common/utils/matomoTags";

export function VideoCard({ video, description, poster, matomoTag, ...props }) {
  const classes = resourceCardsClasses();
  const { trackEvent } = useMatomo();

  const clickEvent = () =>
    matomoTag ? trackEvent(PLAY_VIDEO(matomoTag)) : () => {};

  return (
    <Card variant="outlined" className={classes.card} {...props}>
      <Typography variant={"h5"} className={classes.description}>
        {description}
      </Typography>
      <video
        style={{ maxHeight: 356 }}
        controls
        height="auto"
        width="100%"
        poster={poster || null}
        preload="metadata"
        onPlay={clickEvent}
      >
        <source src={video} type="video/mp4" />
        <p>
          Votre navigateur ne prend pas en charge les vidéos HTML5. Voici{" "}
          <a href={video}>un lien pour télécharger la vidéo</a>
        </p>
      </video>
    </Card>
  );
}
