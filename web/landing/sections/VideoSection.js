import React from "react";
import Grid from "@mui/material/Grid";
import { VideoCard, VIDEOS } from "../ResourcePage/VideoCard";

export function VideoSection() {
  return (
    <Grid container direction="row" alignItems="center" spacing={1}>
      <Grid item xs={12} sm={6}>
        <VideoCard
          video={VIDEOS.Home_Mobilic}
          titleProps={{ component: "h3" }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <VideoCard
          video={VIDEOS.Home_Regulation}
          titleProps={{ component: "h3" }}
        />
      </Grid>
    </Grid>
  );
}
