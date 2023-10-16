import React from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { VideoCard } from "./VideoCard";

export function DriverVideoSection({ buttonStyle }) {
  return (
    <>
      <Grid container direction="row" alignItems="center" spacing={10}>
        <Grid item xs={12} sm={6}>
          <VideoCard
            id="873641403"
            title="salarie-inscription"
            description="Inscription sur Mobilic"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard
            id="873641430"
            title="salarie-installation-appli-android"
            description="Télécharger Mobilic sur Android"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard
            id="873641464"
            title="salarie-installation-appli-iphone"
            description="Télécharger Mobilic sur iPhone"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard
            id="873641485"
            title="salarie-usage-quotidien"
            description="Utiliser Mobilic au quotidien"
          />
        </Grid>
      </Grid>
      <Button
        color="primary"
        size="small"
        className={buttonStyle}
        variant={"outlined"}
        href="https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg/videos"
        target="_blank"
      >
        Voir toutes les vidéos
      </Button>
    </>
  );
}
