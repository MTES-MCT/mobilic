import Stack from "@mui/material/Stack";
import { makeStyles } from "@mui/styles";
import { LoadingButton } from "common/components/LoadingButton";
import React from "react";
import { VIDEOS, VideoCard } from "../../ResourcePage/VideoCard";
import { resourceCardsClasses } from "../../ResourcePage/styles/ResourceCardsStyle";
import { TestimonialCard } from "../../ResourcePage/TestimonialCard";
import { BretagneMaceDemenagementImage, VirImage } from "common/utils/icons";
import Box from "@mui/material/Box";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ADMIN_LANDING_SUBSCRIBE_TESTIMONY } from "common/utils/matomoTags";

const useStyles = makeStyles(theme => ({
  button: {
    margin: "auto"
  },
  videoContainer: {
    width: "320px"
  },
  testimonialContainer: {
    width: "340px"
  }
}));

export function Testimony() {
  const classes = useStyles();
  const cardClasses = resourceCardsClasses();
  const { trackEvent } = useMatomo();

  return (
    <Stack direction="column" gap={8} alignItems="center">
      <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="center">
        <Box className={classes.testimonialContainer}>
          <TestimonialCard
            ImageComponent={VirImage}
            sentence={
              <span>
                « Nous n'utilisons plus que Mobilic pour le suivi du temps de
                travail. Nos collaborateurs l'ont adopté sans difficulté. »
                <br />
                <br />
              </span>
            }
            author="Raphaël Grenom, directeur de l'agence VIR Dijon"
          />
        </Box>
        <Box className={classes.videoContainer}>
          <VideoCard
            video={VIDEOS.Testimony_Almy}
            className={cardClasses.pressCard}
          />
        </Box>
        <Box className={classes.testimonialContainer}>
          <TestimonialCard
            ImageComponent={BretagneMaceDemenagementImage}
            sentence={
              <span>
                « C'est un gain de temps considérable. Les salariés sont
                autonomes et le suivi du côté de l'exploitant est facile. »
                <br />
                <br />
              </span>
            }
            author="Yoann Macé, gérant chez Bretagne Macé déménagement"
          />
        </Box>
      </Stack>
      <LoadingButton
        variant="contained"
        color="primary"
        className={classes.button}
        href="/signup/admin"
        onClick={() => trackEvent(ADMIN_LANDING_SUBSCRIBE_TESTIMONY)}
      >
        Moi aussi je simplifie ma gestion administrative
      </LoadingButton>
    </Stack>
  );
}
