import React from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { Header } from "../common/Header";
import { LinkButton } from "../common/LinkButton";

const useStyles = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  section: {
    padding: theme.spacing(10),
    margin: 0
  }
}));

function _Landing({ width }) {
  const classes = useStyles();
  return [
    <Header key={1} />,
    <Container
      key={2}
      className="no-margin-no-padding scrollable"
      maxWidth={false}
    >
      <Container className={classes.section} maxWidth={false}>
        <Typography variant="h2">👋</Typography>
        <Typography variant="h2">Bienvenue sur MobiLIC !</Typography>
        {isWidthUp("md", width) && (
          <Box mt={2}>
            <Typography variant="h5" style={{ fontWeight: "normal" }}>
              Mobilic est la plateforme gouvernementale de suivi du temps de
              travail dans le transport
            </Typography>
          </Box>
        )}
      </Container>
      <Container
        className={`${classes.section} ${classes.whiteSection}`}
        maxWidth={false}
      >
        <Grid container spacing={10} justify="space-around">
          <Grid item md={4}>
            <Grid container spacing={2} direction="column" alignItems="stretch">
              <Grid item>
                <Typography>
                  Je suis un travailleur mobile ou un gestionnaire d'une
                  entreprise de transport
                </Typography>
              </Grid>
              <Grid item>
                <LinkButton variant="contained" color="primary" href="/signup">
                  M'inscrire
                </LinkButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={4}>
            <Grid container spacing={2} direction="column" alignItems="stretch">
              <Grid item style={{ position: "relative" }}>
                <Typography style={{ position: "absolute", left: 0, right: 0 }}>
                  J'ai déjà un compte Mobilic et je souhaite me connecter
                </Typography>
                <Typography className="hidden">
                  Je suis un travailleur mobile ou un gestionnaire d'une
                  entreprise de transport
                </Typography>
              </Grid>
              <Grid item>
                <LinkButton variant="contained" color="primary" href="/login">
                  Me connecter
                </LinkButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Container>
  ];
}

export const Landing = withWidth()(_Landing);
