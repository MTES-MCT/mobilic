import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { LoadingButton } from "common/components/LoadingButton";
import { useIsWidthDown } from "common/utils/useWidth";
import React from "react";
import { VIDEOS, VideoCard } from "../../ResourcePage/VideoCard";
import BackgroundImage from "common/assets/images/landing-gestionnaire-hero-background.png";
import { useWebinars } from "../../useWebinars";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ADMIN_LANDING_SUBSCRIBE_TOP,
  ADMIN_LANDING_WEBINARS
} from "common/utils/matomoTags";

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
    justifyContent: "center",
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
    rowGap: "48px",
    width: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    },
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  heroButtons: {
    display: "flex",
    flexDirection: "row",
    gap: "16px"
  },
  heroVideo: {
    margin: "0 auto",
    width: "40%",
    maxWidth: "360px"
  },
  textIntro: {
    fontWeight: 500,
    maxWidth: "600px",
    lineHeight: "initial",
    fontSize: "2.2rem"
  },
  textTitle: {
    maxWidth: "600px",
    fontSize: "2.2rem"
  },
  button: {
    textAlign: "center"
  }
}));

export function IntroGestionnaire() {
  const classes = useStyles();
  const isSmDown = useIsWidthDown("sm");
  const { trackEvent } = useMatomo();

  const [webinars] = useWebinars(() => {});

  const Buttons = React.useMemo(
    () => (
      <div className={classes.heroButtons}>
        <LoadingButton
          className={classes.button}
          variant="contained"
          color="primary"
          href="/signup/admin"
          onClick={() => trackEvent(ADMIN_LANDING_SUBSCRIBE_TOP)}
        >
          J'inscris mon entreprise
        </LoadingButton>
        {webinars?.length > 0 && (
          <LoadingButton
            className={classes.button}
            variant="outlined"
            color="primary"
            href="/#webinaires"
            onClick={() => trackEvent(ADMIN_LANDING_WEBINARS)}
          >
            J'assiste à une démonstration
          </LoadingButton>
        )}
      </div>
    ),
    [isSmDown, webinars]
  );

  return (
    <Container maxWidth={false} className={classes.heroContainer}>
      <Container
        maxWidth="xl"
        className={`${isSmDown ? "" : "fade-in-image"} ${classes.heroInner}`}
      >
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
          {!isSmDown && Buttons}
        </div>
        <div className={classes.heroVideo}>
          <VideoCard video={VIDEOS.Home_Mobilic} />
        </div>
        {isSmDown && Buttons}
      </Container>
    </Container>
  );
}
