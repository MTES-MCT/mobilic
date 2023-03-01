import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Header } from "../common/Header";
import { Footer } from "./footer";
import { PaperContainerTitle } from "../common/PaperContainer";
import { MainCtaButton } from "../pwa/components/MainCtaButton";
import BetagouvLogo from "common/assets/images/betagouvlogo.png";
import Emoji from "../common/Emoji";
import { Link } from "../common/LinkButton";

// This condition actually should detect if it's a Node environment
if (typeof require.context === "undefined") {
  const fs = require("fs");
  const path = require("path");

  require.context = (
    base = ".",
    scanSubDirectories = false,
    regularExpression = /\.js$/
  ) => {
    const files = {};

    function readDirectory(directory) {
      fs.readdirSync(directory).forEach(file => {
        const fullPath = path.resolve(directory, file);

        if (fs.statSync(fullPath).isDirectory()) {
          if (scanSubDirectories) readDirectory(fullPath);
          return;
        }

        if (!regularExpression.test(fullPath)) return;

        files[fullPath] = true;
      });
    }

    readDirectory(
      path.resolve(__dirname, "../../common/assets/images/sponsor-logos")
    );

    function Module(file) {
      return require(file);
    }

    Module.keys = () => Object.keys(files);

    return Module;
  };
}

const sponsorsSrcs = require.context(
  "!url-loader?limit=10000&name=static%2Fsponsor-logos%2F%5Bname%5D.%5Bext%5D!common/assets/images/sponsor-logos",
  true,
  /\.(png|jpe?g|svg)$/
);

const partnersSrcs = require.context(
  "!url-loader?limit=10000&name=static%2Fpartner-logos%2F%5Bname%5D.%5Bext%5D!common/assets/images/partner-logos",
  true,
  /\.(png|jpe?g|svg)$/
);

const interfacedSrcs = require.context(
  "!url-loader?limit=10000&name=static%2Finterfaced-logos%2F%5Bname%5D.%5Bext%5D!common/assets/images/interfaced-logos",
  true,
  /\.(png|jpe?g|svg)$/
);

const useStyles = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    margin: 0
  },
  inner: {
    margin: "auto",
    padding: 0
  },
  cta: {
    marginTop: theme.spacing(4)
  },
  paragraph: {
    marginBottom: theme.spacing(2)
  },
  list: {
    listStyleType: "none",
    paddingLeft: 0
  },
  title: {
    marginBottom: theme.spacing(6)
  },
  logoSection: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row"
    },
    gap: theme.spacing(4),
    alignItems: "center"
  },
  sponsorImage: {
    height: 80,
    [theme.breakpoints.up("md")]: {
      height: 160
    }
  },
  partnerImage: {
    height: 60,
    [theme.breakpoints.up("md")]: {
      height: 80
    }
  }
}));

export function Partners() {
  const classes = useStyles();

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="md" className={classes.inner}>
        <Box>
          <PaperContainerTitle>
            Mobilic, un label ? <Emoji emoji="🤝" ariaLabel="Partenariat" />
          </PaperContainerTitle>
        </Box>
        <Box className={classes.logoSection}>
          <Box className={classes.whiteSection}>
            <img alt="beta.gouv" src={BetagouvLogo} height={200} />
          </Box>
          <Typography align="justify">
            Mobilic s’est fixé comme mission principale de{" "}
            <strong>
              lutter contre le travail illégal dans le transport léger
            </strong>
            . Cette mission, complexe et ambitieuse, comprend à ce titre un
            double objectif: garantir aux salariés le respect de leurs droits
            mais également limiter la concurrence déloyale très souvent permise
            par le dumping social.
          </Typography>
        </Box>
        <Box my={10} style={{ textAlign: "justify" }}>
          <Typography variant="h4" className={classes.title}>
            Les entreprises partenaires de Mobilic: des entreprises
            respectueuses des droits sociaux ?
          </Typography>
          <Typography>
            Mobilic{" "}
            <strong>
              garantit que son entreprise partenaire répond aux exigences
              suivantes
            </strong>{" "}
            :
          </Typography>
          <ul>
            <li>
              <Typography>
                une saisie du temps de travail en temps réel et une traçabilité
                des modifications qui limitent les possibilités de fraude.
              </Typography>
            </li>
            <li>
              <Typography>
                une totale transparence auprès des salariés sur leur temps de
                travail qui leur permet de contrôler la cohérence avec leur
                fiche de paye.
              </Typography>
            </li>
          </ul>
          <Typography>
            L’engagement des entreprises partenaires de Mobilic démontre leur
            engagement en matière de responsabilité sociale et environnementale.
          </Typography>
        </Box>
        <Box my={10}>
          <Typography variant="h4" className={classes.title}>
            Ils soutiennent Mobilic
          </Typography>
          <Grid
            container
            justifyContent="space-evenly"
            alignItems="center"
            spacing={{ xs: 2, sm: 4, md: 7 }}
          >
            {sponsorsSrcs.keys().map(src => (
              <Grid item key={src}>
                <img
                  alt={src}
                  src={sponsorsSrcs(src)}
                  className={classes.sponsorImage}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box my={10}>
          <Typography variant="h4" className={classes.title}>
            Ils sont partenaires de Mobilic
          </Typography>
          <Grid
            container
            justifyContent="space-evenly"
            alignItems="center"
            spacing={{ xs: 2, sm: 4, md: 7 }}
          >
            {partnersSrcs.keys().map(src => (
              <Grid item key={src}>
                <img
                  alt={src}
                  src={partnersSrcs(src)}
                  className={classes.partnerImage}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Grid container spacing={8} style={{ textAlign: "justify" }}>
          <Grid item sm={6}>
            <Typography className="bold">
              Quels avantages d'être partenaires ?
            </Typography>
            <ul className={classes.list}>
              <li>
                <Typography>
                  <Emoji emoji="✅" ariaLabel="Avantage" /> Mise en visibilité
                  lors des diverses communications de l’équipe Mobilic (lettre
                  d'information, présentations) et via le référencement sur le
                  site Mobilic via la page "Partenaires".
                </Typography>
              </li>
              <li>
                <Typography>
                  <Emoji emoji="✅" ariaLabel="Avantage" /> Participation à des
                  ateliers exclusifs sur le produit à travers notre comité
                  produit restreint.
                </Typography>
              </li>
              <li>
                <Typography>
                  <Emoji emoji="✅" ariaLabel="Avantage" /> Accès à des
                  informations privilégiées sur l'avancement et les évolutions
                  autour du produit.
                </Typography>
              </li>
            </ul>
          </Grid>
          <Grid item sm={6}>
            <Typography className="bold">Quels engagements ?</Typography>
            <ul className={classes.list}>
              <li>
                <Typography>
                  <Emoji emoji="👉" ariaLabel="Information" /> L’entreprise
                  utilise Mobilic activement, c’est à dire que plus 75% de ses
                  salariés l’utilisent pour suivre leur temps de travail.
                </Typography>
              </li>
              <li>
                <Typography>
                  <Emoji emoji="👉" ariaLabel="Information" /> L’entreprise
                  s’engage “moralement” à donner du feedback sur l’utilisation
                  et l’amélioration de l’outil.
                </Typography>
              </li>
            </ul>
          </Grid>
        </Grid>
        <MainCtaButton
          aria-label="Devenir partenaire"
          className={classes.cta}
          href="mailto:mobilic@beta.gouv.fr"
        >
          Devenir partenaire
        </MainCtaButton>
        <Box my={10}>
          <Typography variant="h4" className={classes.title}>
            Ils sont interfacés avec Mobilic
          </Typography>
          <Grid
            container
            justifyContent="space-evenly"
            alignItems="center"
            spacing={{ xs: 2, sm: 4, md: 7 }}
          >
            {interfacedSrcs.keys().map(src => (
              <Grid item key={src}>
                <img
                  alt={src}
                  src={interfacedSrcs(src)}
                  className={classes.partnerImage}
                />
              </Grid>
            ))}
          </Grid>
          <Grid pt={6}>
            <Typography align="justify" className={classes.paragraph}>
              Les logiciels interfacés avec Mobilic communiquent de manière
              instantanée avec ce dernier : s'il s'agit d'outils de suivi du
              temps de travail, ils envoient les données enregistrées par les
              salariés à Mobilic, ce qui leur permet d'être conformes à la
              réglementation en cas de contrôle. Inversement, ces logiciels
              peuvent aussi récupérer les données enregistrées directement dans
              Mobilic pour établir des bulletins de paie ou gérer vos effectifs
              sans ressaisie de la part du responsable d'exploitation.
            </Typography>
            <Typography align="justify" className={classes.paragraph}>
              Si vous êtes une entreprise souhaitant interfacer son logiciel de
              gestion avec Mobilic, mettez-le en contact avec nous :
              <Link href="mailto:mobilic@beta.gouv.fr">
                {" "}
                mobilic@beta.gouv.fr
              </Link>
              . Si vous êtes un logiciel, écrivez-nous à la même adresse pour
              vous interfacer.
            </Typography>
          </Grid>
        </Box>
      </Container>
    </Container>,
    <Footer key={3} />
  ];
}
