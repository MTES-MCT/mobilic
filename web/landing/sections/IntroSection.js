import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import BackgroundHorizontalImage from "common/assets/images/landing-hero-horizontal.jpg";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { useIsWidthDown } from "common/utils/useWidth";
import classNames from "classnames";
import { fr } from "@codegouvfr/react-dsfr";
import { Stack } from "@mui/material";
import { LoginBanner } from "../components/LoginBanner";

const useStyles = makeStyles((theme) => ({
  title: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
  },
  heroContainer: {
    padding: 0,
    margin: 0,
  },
  explanation: {
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
  },
  objective: {
    fontWeight: "bold",
  },
  phoneImage: {
    float: "left",
    maxWidth: "594px",
  },
}));

const PhoneImageComponent = () => {
  const classes = useStyles();
  return (
    <Grid item xs={12} sm={6} lg={8} zIndex={-1}>
      <img
        className={classes.phoneImage}
        src={BackgroundHorizontalImage}
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
    <Stack direction="column" rowGap={2}>
      <Typography className={classes.explanation}>
        Mobilic est une alternative numérique au livret individuel de contrôle
        (LIC).
      </Typography>
      <Typography
        className={classNames(classes.objective, classes.explanation)}
      >
        L'objectif : faciliter l'application de la réglementation&nbsp;!
      </Typography>
    </Stack>
  );
};

const Title = () => {
  const classes = useStyles();
  return (
    <Typography variant="h3" component="h2" className={classes.title}>
      La plateforme numérique gouvernementale du suivi de temps de travail dans
      le transport routier léger.
    </Typography>
  );
};

export function IntroSection() {
  const classes = useStyles();
  const isXlDown = useIsWidthDown("xl");

  return (
    <Container maxWidth={false} className={classes.heroContainer}>
      <LoginBanner />
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1440px",
          textAlign: "left",
          marginY: isXlDown ? 5 : 10,
          paddingX: isXlDown ? 3 : 0,
        }}
      >
        {isXlDown ? (
          <Stack
            direction="column"
            justifyContent="center"
            rowGap={6}
            alignItems="center"
          >
            <Title />
            <PhoneImageComponent />
            <Explanation />
          </Stack>
        ) : (
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            columnGap={4}
          >
            <Stack direction="column" maxWidth="594px" rowGap={3}>
              <Title />
              <Explanation />
            </Stack>
            <PhoneImageComponent />
          </Stack>
        )}
      </Container>
    </Container>
  );
}
