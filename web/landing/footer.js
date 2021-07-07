import React from "react";
import { useModals } from "common/utils/modals";
import Grid from "@material-ui/core/Grid";
import { FabNumIcon, MarianneIcon } from "common/utils/icons";
import Typography from "@material-ui/core/Typography";
import { Link } from "../common/LinkButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Hidden from "@material-ui/core/Hidden";
import { SocialNetworkPanel } from "../common/Header";

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
  },
  betaGouvLink: {
    color: "inherit",
    textDecoration: "underline"
  },
  socialNetworkContainer: {
    paddingTop: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  socialNetworkTitle: {
    marginBottom: theme.spacing(1)
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
      <Container maxWidth="lg" className={classes.inner}>
        <Grid
          container
          spacing={8}
          justify="space-between"
          alignItems="flex-start"
        >
          <Grid
            item
            sm={5}
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
                  membre du réseau d’incubateurs{" "}
                  {
                    <Link
                      className={classes.betaGouvLink}
                      href="https://beta.gouv.fr"
                    >
                      beta.gouv.fr
                    </Link>
                  }
                  .
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
              <Link to="/partners" color="inherit">
                Partenaires
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
            <Typography className={classes.footerLink}>
              Accessibilité : non conforme
            </Typography>
          </Grid>
          <Hidden xsDown>
            <Grid item>
              <Typography
                variant="h4"
                align="left"
                className={classes.footerLinksSectionTitle}
              >
                Mobilic sur smartphone
              </Typography>
              <img
                src="/landing-qrcode.svg"
                height={150}
                style={{ float: "left" }}
              />
            </Grid>
          </Hidden>
        </Grid>
      </Container>
      <Container className={classes.socialNetworkContainer}>
        <Typography className={classes.socialNetworkTitle} variant="caption">
          Suivez-nous sur les réseaux sociaux !
        </Typography>
        <SocialNetworkPanel darkBackground={true} spacing={2} size={36} />
      </Container>
    </Container>
  );
}
