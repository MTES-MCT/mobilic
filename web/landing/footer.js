import React from "react";
import { useModals } from "common/utils/modals";
import Grid from "@material-ui/core/Grid";
import { FabNumIcon, MarianneIcon } from "common/utils/icons";
import Typography from "@material-ui/core/Typography";
import { Link } from "../common/LinkButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
  section: {
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    margin: 0
  },
  footerLinksSection: {
    textAlign: "left"
  },
  footerLinksSectionTitle: {
    paddingBottom: theme.spacing(2)
  },
  footerLink: {
    paddingBottom: theme.spacing(1)
  },
  inner: {
    margin: "auto",
    padding: 0
  },
  dark: {
    backgroundColor: theme.palette.background.dark,
    color: theme.palette.primary.contrastText
  }
}));

export function Footer() {
  const classes = useStyles();
  const modals = useModals();

  return (
    <Container
      key={6}
      className={`${classes.section} ${classes.dark}`}
      maxWidth={false}
    >
      <Container maxWidth="md" className={classes.inner}>
        <Grid
          container
          spacing={10}
          justify="space-between"
          alignItems="flex-start"
        >
          <Grid
            item
            sm={6}
            container
            alignItems="center"
            spacing={4}
            direction="column"
          >
            <Grid
              item
              container
              wrap="nowrap"
              spacing={2}
              direction="row"
              alignItems="flex-start"
            >
              <Grid item>
                <FabNumIcon scale={0.5} />
              </Grid>
              <Grid item>
                <Typography align="justify">
                  Mobilic est un service numérique de l'Etat incubé à la
                  Fabrique Numérique du Ministère de la Transition écologique,
                  membre du réseau d’incubateurs beta.gouv.fr.
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              container
              wrap="nowrap"
              spacing={2}
              direction="row"
              alignItems="flex-start"
            >
              <Grid item>
                <MarianneIcon
                  style={{ width: 70, height: 70, backgroundColor: "white" }}
                  htmlColor="black"
                />
              </Grid>
              <Grid item>
                <Typography align="justify">
                  Mobilic est une initiative soutenue par la Direction générale
                  des infrastructures des transports et de la mer (DGITM).
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={classes.footerLinksSection}>
            <Typography
              variant="h4"
              className={classes.footerLinksSectionTitle}
            >
              A propos de Mobilic
            </Typography>
            <Typography className={classes.footerLink}>
              <Link href="mailto:mobilic@beta.gouv.fr" color="inherit">
                Nous contacter
              </Link>
            </Typography>
            <Typography className={classes.footerLink}>
              <Link
                href="https://faq.mobilic.beta.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                Foire aux questions
              </Link>
            </Typography>
            <Typography className={classes.footerLink}>
              <Link
                href="/developers/docs/intro"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                Espace développeurs
              </Link>
            </Typography>
            <Typography className={classes.footerLink}>
              <Link to="/stats" color="inherit">
                Statistiques
              </Link>
            </Typography>
            <Typography className={classes.footerLink}>
              <Link
                component="button"
                color="inherit"
                onClick={() => modals.open("cgu")}
                variant="body1"
              >
                Conditions générales d'utilisation
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
}
