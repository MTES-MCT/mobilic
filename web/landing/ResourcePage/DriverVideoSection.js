import React from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { VideoCard } from "./VideoCard";

import SalarieInscriptionVideo from "common/assets/videos/salaries/salarie-inscription.mp4";
import SalarieInscriptionPoster from "common/assets/videos/salaries/salarie-inscription.jpg";
import SalarieInstallAndroidVideo from "common/assets/videos/salaries/salarie-installation-appli-android.mp4";
import SalarieInstallAndroidPoster from "common/assets/videos/salaries/salarie-installation-appli-android.jpg";
import SalarieInstallIphoneVideo from "common/assets/videos/salaries/salarie-installation-appli-iphone.mp4";
import SalarieInstallIphonePoster from "common/assets/videos/salaries/salarie-installation-appli-iphone.jpg";
import SalarieUsageQuotidienVideo from "common/assets/videos/salaries/salarie-usage-quotidien.mp4";
import SalarieUsageQuotidienPoster from "common/assets/videos/salaries/salarie-usage-quotidien.jpg";

export function DriverVideoSection({ buttonStyle }) {
  return (
    <>
      <Grid container direction="row" alignItems="center" spacing={10}>
        <Grid item xs={12} sm={6}>
          <VideoCard
            description="Inscription sur Mobilic"
            video={SalarieInscriptionVideo}
            poster={SalarieInscriptionPoster}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard
            description="Télécharger Mobilic sur Android"
            video={SalarieInstallAndroidVideo}
            poster={SalarieInstallAndroidPoster}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard
            description="Télécharger Mobilic sur iPhone"
            video={SalarieInstallIphoneVideo}
            poster={SalarieInstallIphonePoster}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VideoCard
            description="Utiliser Mobilic au quotidien"
            video={SalarieUsageQuotidienVideo}
            poster={SalarieUsageQuotidienPoster}
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
