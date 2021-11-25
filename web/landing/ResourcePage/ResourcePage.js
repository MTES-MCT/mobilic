import React from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import Button from "@material-ui/core/Button";
import { FaqCard } from "./FaqCard";
import { ControllerImage, ManagerImage, WorkerImage } from "common/utils/icons";
import Box from "@material-ui/core/Box";
import { IconCard } from "./IconCard";

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
    padding: 0,
    textAlign: "left",
    flexGrow: 1
  },
  title: {
    marginBottom: theme.spacing(6)
  },
  resourceSubtitle: {
    marginBottom: theme.spacing(3)
  },
  faqButton: {
    float: "right",
    marginTop: theme.spacing(2)
  },
  linkRole: {
    textTransform: "none",
    width: "100%"
  },
  roleCard: {
    borderRadius: 10,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.main,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    width: "100%"
  },
  roleImage: {
    display: "block",
    margin: "auto"
  }
}));

export function ResourcePage() {
  const classes = useStyles();

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Bienvenue sur la page documentation
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je découvre Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={8}>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Qu'est ce que Mobilic ?"
              answer="Mobilic est un outil numérique de saisie et de suivi du temps de travail."
              link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Qui est concerné par Mobilic ?"
              answer="Toutes les entreprises de transport léger et de déménagement."
              link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Est-il possible de remplacer le livret individuel de contrôle par Mobilic ?"
              answer="Oui, si vous utilisez Mobilic, vous n'avez pas besoin de continuer à remplir le LIC."
              link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/securite-et-confidentialite-des-donnees"
            />
          </Grid>
        </Grid>
        <Button
          color="primary"
          size="small"
          className={classes.faqButton}
          variant={"outlined"}
          href="https://faq.mobilic.beta.gouv.fr/public/"
        >
          En savoir plus sur Mobilic
        </Button>
      </Container>
    </Container>,
    <Container
      key={3}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je cherche de la documentation pour m'aider à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="center" spacing={8}>
          <Grid item xs={12} sm={4}>
            <IconCard
              link="/resources/admin"
              description="Documentation gestionnaire"
              IconComponent={ManagerImage}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <IconCard
              link="/resources/driver"
              description="Documentation travailleur mobile"
              IconComponent={WorkerImage}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <IconCard
              link="/resources/controller"
              description="Documentation contrôleur"
              IconComponent={ControllerImage}
            />
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Container
      key={4}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je cherche des informations sur la réglementation en vigueur dans le
          transport léger
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={8}>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Durée maximale de travail sans interruption"
              answer={
                <Box>
                  Les chauffeurs de véhicules légers ne peuvent pas conduire
                  plus de <b>6 heures d'affilée.</b>
                </Box>
              }
              link="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026054561"
              moreInfoText="Article L.3312-2 du code des transports"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Durée maximale de travail journalier"
              answer={
                <Box>
                  Sauf cas exceptionnel, les salariés du transport léger ne
                  peuvent pas travailler plus de <b>12 heures par jour</b>.
                </Box>
              }
              link="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450339"
              moreInfoText="Article R.3312-51 du code des transports"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Durée maximale d'une journée de travail en partie effectuée de nuit"
              answer={
                <Box>
                  Dans le transport léger, lorsqu'une partie des tâches est
                  effectuée de nuit, le travail journalier ne peut pas dépasser{" "}
                  <b>10 heures</b>.
                </Box>
              }
              link="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033021297"
              moreInfoText="Article L3312-1 du code des transports"
            />
          </Grid>
        </Grid>
        <Button
          color="primary"
          size="small"
          className={classes.faqButton}
          variant={"outlined"}
          href="https://faq.mobilic.beta.gouv.fr/public/"
        >
          Voir tous les seuils réglementaires
        </Button>
      </Container>
    </Container>,
    <Footer key={5} />
  ];
}
