import React from "react";
import Grid from "@mui/material/Grid";
import { VideoCard, VIDEOS } from "./VideoCard";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function DriverVideoSection({ buttonStyle }) {
  return (
    <>
      <Grid container direction="row" alignItems="center" spacing={10}>
        <Grid item xs={12} sm={6}>
          <VideoCard video={VIDEOS.Employee_Inscription} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard video={VIDEOS.Employee_Installation_Android} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard video={VIDEOS.Employee_Installation_Iphone} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard video={VIDEOS.Employee_Usage} />
        </Grid>
      </Grid>
      <Button
        priority="secondary"
        size="small"
        className={buttonStyle}
        linkProps={{
          href:
            "https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg/videos",
          target: "_blank"
        }}
      >
        Voir toutes les vidéos
      </Button>
    </>
  );
}
