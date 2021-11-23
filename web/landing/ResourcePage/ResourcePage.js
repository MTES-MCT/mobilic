import React from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { Card } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { LinkButton } from "../../common/LinkButton";
import { FaqCard } from "./FaqCard";
import { ControlerImage, ManagerImage, WorkerImage } from "common/utils/icons";

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
  resourceHeadParagraph: {
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
          Bienvenue sur la page ressources
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je découvre Mobilic et je souhaite savoir comment ça fonctionne
        </Typography>
        <Typography className={classes.resourceHeadParagraph}>
          Les questions les plus fréquentes :
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={8}>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Qu'est ce que Mobilic ?"
              answer="Mobilic est un service numérique qui permet l’enregistrement, le suivi et le contrôle du temps des travailleurs mobiles."
              link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/vos-questions-recurrentes#a-quoi-sert-mobilic"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Comment installer Mobilic ?"
              answer="Mobilic est un site web pouvant s'installer comme une application sur les téléphones Android et iPhone."
              link="https://www.youtube.com/channel/UCqJlEoGiU1jcFjJWAr1BcVg"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Qui a accès aux données Mobilic ?"
              answer="L'accès aux données salariés de Mobilic est strictement encadré."
              link="https://faq.mobilic.beta.gouv.fr/public/securite-et-confidentialite-des-donnees/acces-aux-donnees"
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
          Accéder à la FAQ
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
          Nous mettons à la disposition des usagers de Mobilic des ressources
          pour apprendre à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="center" spacing={8}>
          <Grid item xs={12} sm={4}>
            <LinkButton to="/resources/admin" className={classes.linkRole}>
              <Card variant="outlined" className={classes.roleCard}>
                <ManagerImage
                  height={150}
                  width={150}
                  className={classes.roleImage}
                />
                <Typography>Documentation gestionnaire</Typography>
              </Card>
            </LinkButton>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LinkButton to="/signup/admin" className={classes.linkRole}>
              <Card variant="outlined" className={classes.roleCard}>
                <WorkerImage
                  height={150}
                  width={150}
                  className={classes.roleImage}
                />
                <Typography>Documentation travailleur mobile</Typography>
              </Card>
            </LinkButton>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LinkButton to="/signup/admin" className={classes.linkRole}>
              <Card variant="outlined" className={classes.roleCard}>
                <ControlerImage
                  height={150}
                  width={150}
                  className={classes.roleImage}
                />
                <Typography>Documentation contrôleur</Typography>
              </Card>
            </LinkButton>
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
              question="Durée du travail quotidien"
              answer="Un travailleur ne doit pas dépasser XX heures de travail par jour."
              link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/vos-questions-recurrentes#a-quoi-sert-mobilic"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Repos journalier"
              answer="Un salarié doit respecter un minimum de XXX heures entre deux jours de travail"
              link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/vos-questions-recurrentes#a-quoi-sert-mobilic"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Temps de pause quotidien"
              answer="Mobilic est un service numérique qui permet l’enregistrement, le suivi et le contrôle du temps des travailleurs mobiles."
              link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/vos-questions-recurrentes#a-quoi-sert-mobilic"
            />
          </Grid>
          {/*<Grid item xs={12} sm={6}>*/}
          {/*  <FaqCard*/}
          {/*    question="Durée max de travail ininterrompu"*/}
          {/*    answer="Un salarié ne peux travailler plus de XX heures sans prendre de pause."*/}
          {/*    link="https://faq.mobilic.beta.gouv.fr/public/comprendre-ce-quest-mobilic/vos-questions-recurrentes#a-quoi-sert-mobilic"*/}
          {/*  />*/}
          {/*</Grid>*/}
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
