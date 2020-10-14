import React from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Header } from "../common/Header";
import { Link, LinkButton } from "../common/LinkButton";
import Hidden from "@material-ui/core/Hidden";
import {
  FabNumIcon,
  ManagerImage,
  SoftwareImage,
  WorkerImage
} from "common/utils/icons";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";
import BackgroundImage from "common/assets/images/vans.png";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  section: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    margin: 0
  },
  darkSection: {
    backgroundColor: theme.palette.background.dark,
    color: theme.palette.primary.contrastText
  },
  sectionTitle: {
    paddingBottom: theme.spacing(6)
  },
  videoHelperText: {
    paddingBottom: theme.spacing(4)
  },
  videoContainer: {
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden"
  },
  videoIframe: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden"
  },
  sectionHPadding: {
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5)
  },
  inner: {
    margin: "auto",
    padding: 0
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
  bgImage: {
    background: `url(${BackgroundImage}) 50%`,
    backgroundSize: "cover"
  },
  showcase: {
    padding: theme.spacing(2)
  },
  lightBlue: {
    backgroundColor: theme.palette.info.light
  },
  lightGreen: {
    backgroundColor: theme.palette.success.light
  },
  lightOrange: {
    backgroundColor: theme.palette.warning.light
  }
}));

function _Showcase({
  image,
  imageDescription,
  imagePosition,
  descriptionTitle,
  descriptionContent,
  width
}) {
  const Image = props => (
    <Grid container direction="column" spacing={1} alignItems="center">
      <Grid item>{image}</Grid>
      <Grid item>
        <Typography className="bold" variant="h4" color="primary">
          {imageDescription}
        </Typography>
      </Grid>
    </Grid>
  );

  const Description = props => [
    <Typography align="left" variant="h4" key={0} className="bold">
      {descriptionTitle}
    </Typography>,
    <React.Fragment key={1}>{descriptionContent}</React.Fragment>
  ];

  const leftAlignImage = isWidthDown("xs", width) || imagePosition === "left";

  return (
    <Grid
      container
      alignItems="center"
      direction="row"
      spacing={4}
      justify="space-between"
    >
      <Grid item xs>
        {leftAlignImage ? <Image /> : <Description />}
      </Grid>
      <Grid item xs>
        {leftAlignImage ? <Description /> : <Image />}
      </Grid>
    </Grid>
  );
}

const Showcase = withWidth()(_Showcase);

export function Landing() {
  const classes = useStyles();
  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.section} ${classes.bgImage}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item className={classes.whiteSection}>
            <Typography variant="h2">👋</Typography>
            <Typography variant="h2">Bienvenue sur Mobilic !</Typography>
          </Grid>
          <Hidden xsDown>
            <Grid item className={classes.whiteSection}>
              <Box mt={2}>
                <Typography variant="h3" style={{ fontWeight: "normal" }}>
                  Le suivi de votre temps de travail : fiable, facile, et rapide
                </Typography>
              </Box>
            </Grid>
          </Hidden>
        </Grid>
      </Container>
    </Container>,
    <Container
      key={3}
      className={`${classes.section} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Grid container spacing={10} justify="space-around">
          <Grid item md={4}>
            <Grid container spacing={2} direction="column" alignItems="stretch">
              <Grid item>
                <Typography>
                  Je suis travailleur mobile ou gestionnaire d'une entreprise de
                  transport
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
                  J'ai déjà un compte Mobilic
                </Typography>
                <Typography className="hidden">
                  Je suis travailleur mobile ou gestionnaire d'une entreprise de
                  transport
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
    </Container>,
    <Container key={4} className={classes.section} maxWidth={false}>
      <Container maxWidth="md" className={classes.inner}>
        <Typography variant="h3" className={`${classes.sectionTitle}`}>
          Mobilic ... 🤔 qu'est-ce que c'est ?
        </Typography>
        <Typography className={classes.videoHelperText}>
          Mobilic est la plateforme gouvernementale qui permet de simplifier le
          suivi du temps de travail dans le transport routier léger afin de
          lutter contre le travail illégal.
        </Typography>
        <Container maxWidth="sm" disableGutters>
          <Box className={classes.videoContainer}>
            <iframe
              className={classes.videoIframe}
              frameBorder="0"
              type="text/html"
              src="https://www.dailymotion.com/embed/video/x7w86gu"
              width="100%"
              height="100%"
              allowFullScreen
            ></iframe>
          </Box>
        </Container>
      </Container>
    </Container>,
    <Container
      key={5}
      className={`${classes.section} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="md" className={classes.inner}>
        <Typography variant="h3" className={`${classes.sectionTitle}`}>
          A qui ça s'adresse ?
        </Typography>
        <Typography className={classes.videoHelperText}>
          {
            "Mobilic s'adresse aux différents métiers des entreprises de transport routier qui utilisent des véhicules utilitaires légers (VUL, < 3.5T)."
          }
        </Typography>
        <Box className={`${classes.lightBlue}`} p={2}>
          <Showcase
            image={<WorkerImage height={200} width={200} />}
            imagePosition="left"
            imageDescription="Travailleur mobile"
            descriptionTitle="Suivre simplement mon temps de travail et être mieux informé sur mes droits"
            descriptionContent={
              <div
                style={{
                  textAlign: "left",
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}
              >
                <p>Directement sur mobile à tout moment</p>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "1rem",
                    lineHeight: "1.6"
                  }}
                >
                  <li>
                    via l’interface de Mobilic (si mon entreprise n’utilise pas
                    de logiciel)
                  </li>
                  <li style={{ fontStyle: "italic", listStyle: "none" }}>ou</li>
                  <li>
                    par l'intermédiaire du logiciel métier de mon entreprise
                    (connecté à Mobilic)
                  </li>
                </ul>
              </div>
            }
          />
        </Box>
        <Box p={2}>
          <Showcase
            image={<ManagerImage height={200} width={200} />}
            imagePosition="right"
            imageDescription="Gestionnaire"
            descriptionTitle="Gérer facilement le temps de travail des salariés de mon entreprise"
            descriptionContent={
              <ul
                style={{
                  textAlign: "left",
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}
              >
                <li>
                  Alléger la gestion administrative des données sociales de mon
                  entreprise en évitant la double saisie des informations
                </li>
                <li>
                  Optimiser l'organisation de mes équipes en accédant aux
                  données sociales en temps réel
                </li>
              </ul>
            }
          />
        </Box>
        <Box className={classes.lightBlue} p={2}>
          <Showcase
            image={<SoftwareImage height={200} width={200} />}
            imagePosition="left"
            imageDescription="Logiciel métier"
            descriptionTitle="Echanger en temps réel avec l'API Mobilic des données sociales clés pour la gestion du personnel"
            descriptionContent={
              <ul
                style={{
                  textAlign: "left",
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}
              >
                <li>
                  Enrichir mon logiciel avec les données sociales, accessibles
                  sans délai
                </li>
                <li>
                  Garantir la conformité réglementaire de mes entreprises
                  clientes
                </li>
              </ul>
            }
          />
        </Box>
      </Container>
    </Container>,
    <Container
      key={5}
      className={`${classes.section} ${classes.darkSection}`}
      maxWidth={false}
    >
      <Container maxWidth="md" className={classes.inner}>
        <Footer />
      </Container>
    </Container>
  ];
}

function Footer() {
  const classes = useStyles();
  const modals = useModals();

  return (
    <Grid
      container
      spacing={10}
      justify="space-between"
      alignItems="flex-start"
    >
      <Grid item sm={6} container alignItems="center" direction="column">
        <Grid
          item
          container
          wrap="nowrap"
          spacing={2}
          direction="row"
          alignItems="flex-start"
        >
          <Hidden xsDown>
            <Grid item>
              <FabNumIcon scale={0.5} />
            </Grid>
          </Hidden>
          <Grid item>
            <Typography align="left">
              Mobilic est un service numérique de l'Etat incubé à la Fabrique
              Numérique du Ministère de la Transition écologique, membre du
              réseau d’incubateurs beta.gouv.fr
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.footerLinksSection}>
        <Typography variant="h4" className={classes.footerLinksSectionTitle}>
          A propos de Mobilic
        </Typography>
        <Typography className={classes.footerLink}>
          <Link href="mailto:mobilic@beta.gouv.fr" color="inherit">
            Nous contacter
          </Link>
        </Typography>
        <Typography className={classes.footerLink}>
          <Link to="/" color="inherit">
            Foire aux questions
          </Link>
        </Typography>
        <Typography className={classes.footerLink}>
          <Link href="/developers/docs/intro" color="inherit">
            Espace développeurs
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
  );
}
