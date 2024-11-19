import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import BackgroundHorizontalImage from "common/assets/images/landing-hero-horizontal.jpg";
import BackgroundVerticalImage from "common/assets/images/landing-hero-vertical.jpg";
import { Link } from "../../common/LinkButton";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { useIsWidthDown } from "common/utils/useWidth";
import classNames from "classnames";
import Notice from "../../common/Notice";

const useStyles = makeStyles(theme => ({
  heroContainer: {
    padding: 0,
    margin: 0
  },
  heroInner: {
    padding: 0,
    textAlign: "left",
    marginTop: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2)
    }
  },
  loginLink: {
    whiteSpace: "nowrap"
  },
  underlineBlue: {
    backgroundColor: "rgba(49, 132, 255, 0.2)"
  },
  leftBlockIntro: {
    marginLeft: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(2)
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(2)
    }
  },
  textTitle: {
    [theme.breakpoints.down("sm")]: {
      marginRight: theme.spacing(3)
    }
  },
  textIntro: {
    fontWeight: "normal",
    marginTop: theme.spacing(0.5),
    [theme.breakpoints.down("sm")]: {
      marginRight: theme.spacing(3)
    }
  },
  explanation: {
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    marginTop: theme.spacing(10),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(6)
    }
  },
  objective: {
    fontWeight: "bold",
    marginTop: theme.spacing(3)
  },
  phoneImageContainer: {
    marginTop: theme.spacing(-18),
    [theme.breakpoints.down("lg")]: {
      marginTop: theme.spacing(-10)
    },
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3)
    }
  },
  phoneImage: {
    float: "left",
    marginLeft: theme.spacing(3),
    maxWidth: "900px",
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(-2)
    }
  }
}));

const PhoneImageComponent = ({ isSmDown }) => {
  const classes = useStyles();
  return (
    <Grid
      item
      xs={12}
      sm={6}
      lg={8}
      className={classes.phoneImageContainer}
      zIndex={-1}
    >
      <img
        className={classes.phoneImage}
        src={isSmDown ? BackgroundVerticalImage : BackgroundHorizontalImage}
        alt="Mobilic-hero"
        width="100%"
        height="auto"
      />
    </Grid>
  );
};

const Explanation = () => {
  const classes = useStyles();
  return (
    <Grid item xs={12} sm={6} lg={4}>
      <Typography className={classes.explanation}>
        Mobilic est une alternative numérique au livret individuel de contrôle
        (LIC) pour l'ensemble des{" "}
        <span className={"bold"}>
          entreprises concernées par la réglementation de suivi du temps de
          travail dans le transport léger et dans le déménagement (-3.5T)
        </span>
      </Typography>
      <Typography
        className={classNames(classes.objective, classes.explanation)}
      >
        L'objectif : faciliter l'application{" "}
        <span style={{ whiteSpace: "nowrap" }}>de la réglementation !</span>
      </Typography>
    </Grid>
  );
};

export function IntroSection() {
  const classes = useStyles();
  const isSmDown = useIsWidthDown("sm");

  return (
    <Container maxWidth={false} className={classes.heroContainer}>
      <Notice
        size="small"
        description={
          <Link variant="login" to="/login-selection">
            <span className={classes.loginLink}>Se connecter à mon espace</span>
          </Link>
        }
      />
      <Container maxWidth="xl" className={`fade-in-image ${classes.heroInner}`}>
        <Grid container direction="row" className={classes.leftBlockIntro}>
          <Grid item xs={12} marginTop={4}>
            <h1 className="fr-sr-only">
              La plateforme numérique gouvernementale de suivi du temps de
              travail dans le transport routier léger
            </h1>
            <div aria-hidden="true">
              <Typography
                className={classes.textTitle}
                variant="h1"
                component="p"
              >
                La plateforme numérique gouvernementale{" "}
              </Typography>
              <Typography
                className={classes.textIntro}
                variant="h2"
                component="p"
              >
                de{" "}
                <span className={classes.underlineBlue}>
                  suivi du temps de travail
                </span>{" "}
              </Typography>
              <Typography
                className={classes.textIntro}
                variant="h2"
                component="p"
              >
                dans le transport routier léger
              </Typography>
            </div>
          </Grid>
          {isSmDown ? (
            <>
              <PhoneImageComponent isSmDown={isSmDown} />
              <Explanation />
            </>
          ) : (
            <>
              <Explanation />
              <PhoneImageComponent isSmDown={isSmDown} />
            </>
          )}
        </Grid>
      </Container>
    </Container>
  );
}
