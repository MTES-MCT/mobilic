import React from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { VideoCard, VIDEOS } from "./VideoCard";

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
