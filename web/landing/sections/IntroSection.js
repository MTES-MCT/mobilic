import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import BackgroundHorizontalImage from "common/assets/images/landing-hero-horizontal.svg";
import BackgroundVerticalImage from "common/assets/images/landing-hero-vertical.svg";
import { Alert } from "@mui/material";
import { Link } from "../../common/LinkButton";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { useIsWidthDown } from "common/utils/useWidth";

const useStyles = makeStyles(theme => ({
  heroContainer: {
    padding: 0,
    margin: 0
  },
  heroInnerDesktop: {
    padding: 0,
    textAlign: "left",
    marginTop: theme.spacing(5)
  },
  heroInnerMobile: {
    padding: 0,
    textAlign: "left",
    marginTop: theme.spacing(2)
  },
  underlineBlue: {
    backgroundColor: "rgba(49, 132, 255, 0.2)"
  },
  leftBlockIntro: {
    marginLeft: theme.spacing(2)
  },
  textIntro: {
    fontWeight: "normal",
    marginTop: theme.spacing(0.5)
  },
  explanationDesktop: {
    fontSize: "1.25em",
    marginTop: theme.spacing(10)
  },
  explanationMobile: {
    fontSize: "1.25em",
    marginTop: theme.spacing(2)
  },
  phoneImageContainerDesktop: {
    marginTop: theme.spacing(-14)
  },
  phoneImageContainerMobile: {
    marginTop: theme.spacing(2)
  },
  phoneImageDesktop: {
    float: "left",
    marginLeft: theme.spacing(3)
  },
  phoneImageMobile: {
    float: "left",
    marginLeft: theme.spacing(-2)
  }
}));

export function IntroSection() {
  const classes = useStyles();
  const PhoneImageComponent = () => (
    <Grid
      item
      xs={12}
      sm={6}
      lg={8}
      className={
        !isSmDown
          ? classes.phoneImageContainerDesktop
          : classes.phoneImageContainerMobile
      }
    >
      <img
        className={
          !isSmDown ? classes.phoneImageDesktop : classes.phoneImageMobile
        }
        src={isSmDown ? BackgroundVerticalImage : BackgroundHorizontalImage}
        alt="Mobilic-hero"
        width="100%"
        height="100%"
      />
    </Grid>
  );
  const Explanation = () => (
    <Grid item xs={12} sm={6} lg={4}>
      <Typography
        className={
          !isSmDown ? classes.explanationDesktop : classes.explanationMobile
        }
      >
        Mobilic est une alternative numérique au livret individuel de contrôle
        (LIC) pour l'ensemble des{" "}
        <span className={"bold"}>
          entreprises concernées par la réglementation de suivi du temps de
          travail dans le transport léger et dans le déménagement (-3.5T)
        </span>
      </Typography>
    </Grid>
  );

  const isSmDown = useIsWidthDown("sm");

  return (
    <Container maxWidth={false} className={classes.heroContainer}>
      {process.env.REACT_APP_SHOW_CONTROLLER_APP === "1" && (
        <Alert severity="info">
          Accès Agent Public :{" "}
          <Link variant="login controleur" to="/controller-login">
            se connecter à mon espace
          </Link>
        </Alert>
      )}
      <Container
        maxWidth="xl"
        className={`fade-in-image ${
          !isSmDown ? classes.heroInnerDesktop : classes.heroInnerMobile
        }`}
      >
        <Grid container direction="row" className={classes.leftBlockIntro}>
          <Grid item xs={12} marginTop={4}>
            <Typography className="bold" variant="h1">
              La plateforme numérique gouvernementale
            </Typography>
            <Typography className={classes.textIntro} variant="h2">
              de{" "}
              <span className={classes.underlineBlue}>
                suivi du temps de travail
              </span>
            </Typography>
            <Typography className={classes.textIntro} variant="h2">
              dans le transport routier léger
            </Typography>
          </Grid>
          {isSmDown ? (
            <>
              <PhoneImageComponent />
              <Explanation />
            </>
          ) : (
            <>
              <Explanation />
              <PhoneImageComponent />
            </>
          )}
        </Grid>
      </Container>
    </Container>
  );
}
