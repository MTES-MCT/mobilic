import React from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Header } from "../common/Header";
import { Footer } from "./footer";
import { PaperContainerTitle } from "../common/PaperContainer";
import { MainCtaButton } from "../pwa/components/MainCtaButton";
import BetagouvLogo from "common/assets/images/betagouvlogo.png";

const imageSrcs = require.context(
  "!url-loader?limit=10000&name=static%2Fpartner-logos%2F%5Bname%5D.%5Bext%5D!common/assets/images/partner-logos",
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
  darkSection: {
    backgroundColor: theme.palette.background.dark,
    color: theme.palette.primary.contrastText
  },
  inner: {
    margin: "auto",
    padding: 0
  },
  lightBlue: {
    backgroundColor: theme.palette.info.light
  },
  lightGreen: {
    backgroundColor: theme.palette.success.light
  },
  lightOrange: {
    backgroundColor: theme.palette.warning.light
  },
  cta: {
    marginTop: theme.spacing(4)
  },
  list: {
    listStyleType: "none",
    paddingLeft: 0
  },
  title: {
    marginBottom: theme.spacing(4)
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
        <PaperContainerTitle>Mobilic, un label ? 🤝</PaperContainerTitle>
        <Grid container direction="row" alignItems="center" spacing={8}>
          <Grid item className={classes.whiteSection}>
            <img src={BetagouvLogo} height={200} />
          </Grid>
          <Grid item sm>
            <Typography align="justify">
              Mobilic s’est fixé comme mission principale de{" "}
              <strong>
                lutter contre le travail illégal dans le transport léger
              </strong>
              . Cette mission, complexe et ambitieuse, comprend à ce titre un
              double objectif: garantir aux salariés le respect de leurs droits
              mais également limiter la concurrence déloyale très souvent
              permise par le dumping social.
            </Typography>
          </Grid>
        </Grid>
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
            Ils sont partenaires de Mobilic
          </Typography>
          <Grid
            container
            justify="space-evenly"
            alignItems="center"
            wrap
            spacing={7}
          >
            {imageSrcs.keys().map(src => (
              <Grid item key={src}>
                <img src={imageSrcs(src)} height={160} />
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
                  ✅ Mise en visibilité lors des diverses communications de
                  l’équipe Mobilic (newsletter, présentations) et via le
                  référencement sur le site Mobilic via la page "Partenaires".
                </Typography>
              </li>
              <li>
                <Typography>
                  ✅ Participation à des ateliers exclusifs sur le produit à
                  travers notre comité produit restreint.
                </Typography>
              </li>
              <li>
                <Typography>
                  ✅ Accès à des informations privilégiées sur l'avancement et
                  les évolutions autour du produit.
                </Typography>
              </li>
            </ul>
          </Grid>
          <Grid item sm={6}>
            <Typography className="bold">Quels engagements ?</Typography>
            <ul className={classes.list}>
              <li>
                <Typography>
                  👉 L’entreprise utilise Mobilic activement, c’est à dire que
                  plus 75% de ses salariés l’utilisent pour suivre leur temps de
                  travail.
                </Typography>
              </li>
              <li>
                <Typography>
                  👉 L’entreprise s’engage “moralement” à donner du feedback sur
                  l’utilisation et l’amélioration de l’outil.
                </Typography>
              </li>
            </ul>
          </Grid>
        </Grid>
        <MainCtaButton
          className={classes.cta}
          href="mailto:mobilic@beta.gouv.fr"
        >
          Devenir partenaire
        </MainCtaButton>
      </Container>
    </Container>,
    <Footer key={3} />
  ];
}
