import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { LoadingButton } from "common/components/LoadingButton";
import { useIsWidthDown } from "common/utils/useWidth";
import React from "react";
import { VideoCard } from "../../ResourcePage/VideoCard";
import BackgroundImage from "common/assets/images/landing-gestionnaire-hero-background.png";
import MobilicPoster from "common/assets/videos/accueil/accueil-qu-est-ce-que-mobilic-preview.jpg";
import MobilicVideo from "common/assets/videos/accueil/accueil-qu-est-ce-que-mobilic.mp4";
import { useWebinars } from "../../useWebinars";

const useStyles = makeStyles(theme => ({
  heroContainer: {
    padding: 0,
    margin: 0
  },
  heroInner: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    padding: "0 32px",
    columnGap: "32px",
    rowGap: "24px",
    textAlign: "left",
    [theme.breakpoints.down("sm")]: {},
    background: `url(${BackgroundImage}) 50%`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right bottom"
  },
  underlineBlue: {
    backgroundColor: "rgba(49, 132, 255, 0.2)"
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    columnGap: "48px",
    rowGap: "24px",
    width: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  },
  heroButtons: {
    display: "flex",
    flexDirection: "row",
    gap: "16px"
  },
  heroVideo: {
    margin: "0 auto"
  },
  textIntro: {
    fontWeight: "normal",
    maxWidth: "600px"
  },
  textTitle: {
    maxWidth: "600px"
  }
}));

export function IntroGestionnaire() {
  const classes = useStyles();
  const isSmDown = useIsWidthDown("sm");

  const [webinars] = useWebinars(() => {});

  return (
    <Container maxWidth={false} className={classes.heroContainer}>
      <Container maxWidth="xl" className={`fade-in-image ${classes.heroInner}`}>
        <div className={classes.heroLeft}>
          <Typography className={classes.textTitle} variant="h1">
            Vous êtes une entreprise de transport routier léger ou de
            déménagement ?
          </Typography>
          <Typography className={classes.textIntro} variant="h2">
            <span className={classes.underlineBlue}>
              Simplifiez la gestion du suivi du temps de travail
            </span>{" "}
            de vos salariés avec l'application Mobilic
          </Typography>
          {!isSmDown && (
            <div className={classes.heroButtons}>
              <LoadingButton
                variant="contained"
                color="primary"
                href="/signup/admin"
              >
                J'inscris mon entreprise
              </LoadingButton>
              {webinars?.length > 0 && (
                <LoadingButton
                  variant="outlined"
                  color="primary"
                  href="/#webinars"
                >
                  J'assiste à une démonstration
                </LoadingButton>
              )}
            </div>
          )}
        </div>
        <div className={classes.heroVideo}>
          <VideoCard
            style={{ margin: "auto", maxWidth: "400px" }}
            description="Mobilic, qu'est-ce que c'est ?"
            video={MobilicVideo}
            poster={MobilicPoster}
          />
        </div>
        {isSmDown && (
          <div className={classes.heroButtons}>
            <LoadingButton variant="contained" color="primary">
              J'inscris mon entreprise
            </LoadingButton>
            <LoadingButton variant="outlined" color="primary">
              J'assiste à une démonstration
            </LoadingButton>
          </div>
        )}
      </Container>
    </Container>
  );
}
