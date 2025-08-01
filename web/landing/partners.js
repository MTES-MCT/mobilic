import React, { useMemo } from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Header } from "../common/Header";
import { Footer } from "./footer";
import { PaperContainerTitle } from "../common/PaperContainer";
import { shuffle } from "lodash/collection";
import { LoadingButton } from "common/components/LoadingButton";
import { usePageTitle } from "../common/UsePageTitle";
import { Main } from "../common/semantics/Main";
import { LinkButton } from "../common/LinkButton";
import { ExternalLink } from "../common/ExternalLink";

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
  title: {
    marginBottom: theme.spacing(6)
  },
  paragraphDescription: {
    textAlign: "left",
    marginBottom: theme.spacing(6)
  },
  sponsorImage: {
    height: 80,
    [theme.breakpoints.up("md")]: {
      height: 100
    }
  },
  partnerImage: {
    height: 60
  },
  interfacedImage: {
    height: 60,
    [theme.breakpoints.up("md")]: {
      height: 80
    }
  }
}));

export function Partners() {
  usePageTitle("Partenaires et logiciels - Mobilic");
  const classes = useStyles();
  const [partnersToShow, setPartnersToShow] = React.useState([]);
  const [showAllPartners, setShowAllPartners] = React.useState(false);

  const shuffledPartners = useMemo(() => {
    return shuffle(partnersSrcs.keys());
  }, []);

  React.useEffect(() => {
    if (showAllPartners) {
      setPartnersToShow(shuffledPartners);
    } else {
      setPartnersToShow(shuffledPartners.slice(0, 16));
    }
  }, [shuffledPartners, showAllPartners]);

  return (
    <>
      <Header />
      <Main
        className={`${classes.container} ${classes.whiteSection}`}
        maxWidth={false}
      >
        <Container maxWidth="xl" className={classes.inner}>
          <Box>
            <PaperContainerTitle variant="h1" className={classes.title}>
              Partenaires et logiciels habilités
            </PaperContainerTitle>
          </Box>
          <Grid container spacing={14}>
            <Grid item xs={12} md={6} textAlign="center">
              <Typography variant="h5" component="h2" className={classes.title}>
                Les entreprises partenaires
              </Typography>
              <Typography className={classes.paragraphDescription}>
                Les entreprises partenaires soutiennent activement l’utilisation
                de Mobilic pour le suivi du temps de travail.
              </Typography>
              <Grid
                container
                justifyContent="space-evenly"
                alignItems="center"
                spacing={{ xs: 2, md: 4 }}
              >
                {partnersToShow.map(src => (
                  <Grid item key={src}>
                    <img
                      alt={src}
                      src={partnersSrcs(src)}
                      className={classes.partnerImage}
                    />
                  </Grid>
                ))}
              </Grid>
              {!showAllPartners && (
                <LoadingButton
                  className={classes.cta}
                  onClick={() => setShowAllPartners(true)}
                  priority="secondary"
                >
                  Voir plus
                </LoadingButton>
              )}
              <div>
                <LinkButton
                  className={classes.cta}
                  to="mailto:contact@mobilic.beta.gouv.fr"
                  priority="primary"
                >
                  Devenir partenaire
                </LinkButton>
              </div>
            </Grid>
            <Grid item xs={12} md={6} textAlign="center">
              <Box marginBottom={16}>
                <Typography
                  variant="h5"
                  component="h2"
                  className={classes.title}
                >
                  Les logiciels habilités
                </Typography>
                <Typography
                  className={classes.paragraphDescription}
                  component="div"
                >
                  Les éditeurs de logiciel sont habilités à assurer le suivi du
                  temps de travail conformément à{" "}
                  <ExternalLink
                    text="l'arrêté du 6 mars 2025"
                    url="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051347969"
                  />{" "}
                  :
                  <br />
                  <br />
                  <ul>
                    <li>
                      Les logiciels de suivi du temps de travail envoient
                      automatiquement à Mobilic les données enregistrées par les
                      salariés, ce qui leur permet d'être conformes à la
                      réglementation en cas de contrôle ;
                    </li>
                    <br />
                    <li>
                      Les autres logiciels récupèrent automatiquement les
                      données enregistrées dans Mobilic pour établir des
                      bulletins de paie ou aider à la gestion des effectifs de
                      leurs clients
                    </li>
                  </ul>
                </Typography>
                <Grid
                  container
                  justifyContent="space-evenly"
                  alignItems="center"
                  spacing={{ xs: 2, sm: 4 }}
                >
                  {interfacedSrcs.keys().map(src => (
                    <Grid item key={src}>
                      <img
                        alt={src}
                        src={interfacedSrcs(src)}
                        className={classes.interfacedImage}
                      />
                    </Grid>
                  ))}
                </Grid>
                <LinkButton
                  className={classes.cta}
                  to="mailto:interfacage@mobilic.beta.gouv.fr"
                  priority="primary"
                >
                  S'interfacer avec Mobilic
                </LinkButton>
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  className={classes.title}
                >
                  Les différents soutiens institutionnels
                </Typography>
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  spacing={{ xs: 2, sm: 4 }}
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
            </Grid>
          </Grid>
        </Container>
      </Main>
      <Footer />
    </>
  );
}
