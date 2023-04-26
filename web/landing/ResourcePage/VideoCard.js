import React from "react";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { PLAY_VIDEO } from "common/utils/matomoTags";

const s3Root =
  "https://storage.gra.cloud.ovh.net/v1/AUTH_8a2f745174054ce1b5ee7c6e79601088/mobilic/";

export function VideoCard({
  videoKey,
  description,
  posterKey,
  matomoTag,
  ...props
}) {
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
        poster={posterKey ? s3Root + posterKey : null}
        preload="metadata"
        onPlay={clickEvent}
      >
        <source src={s3Root + videoKey} type="video/mp4" />
        <p>
          Votre navigateur ne prend pas en charge les vidéos HTML5. Voici{" "}
          <a href={s3Root + videoKey}>un lien pour télécharger la vidéo</a>
        </p>
      </video>
    </Card>
  );
}
