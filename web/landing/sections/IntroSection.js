import React from "react";
import Typography from "@mui/material/Typography";
import BackgroundHorizontalImage from "common/assets/images/landing-hero-horizontal.jpg";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { useIsWidthDown } from "common/utils/useWidth";
import classNames from "classnames";
import { fr } from "@codegouvfr/react-dsfr";
import { Stack } from "@mui/material";
import { OuterContainer } from "../components/OuterContainer";
import { InnerContainer } from "../components/InnerContainer";

const useStyles = makeStyles((theme) => ({
  title: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
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
      <br />
      le transport routier léger.
    </Typography>
  );
};

export function IntroSection() {
  const isXlDown = useIsWidthDown("xl");

  return (
    <OuterContainer>
      <InnerContainer>
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
            <Stack direction="column" rowGap={3} flex={1}>
              <Title />
              <Explanation />
            </Stack>
            <PhoneImageComponent />
          </Stack>
        )}
      </InnerContainer>
    </OuterContainer>
  );
}
