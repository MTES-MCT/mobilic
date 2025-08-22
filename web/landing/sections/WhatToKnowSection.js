import React from "react";
import { makeStyles } from "@mui/styles";

import { Grid, Typography } from "@mui/material";
import { LandingSection } from "./LandingSection";
import { LinkButton } from "../../common/LinkButton";

const useStyles = makeStyles(theme => ({
  faqCta: {
    flexShrink: 0,
    flexBasis: "auto",
    margin: "auto"
  },
  questionTitle: {
    paddingBottom: theme.spacing(1)
  }
}));

export const WhatToKnowSection = () => {
  const classes = useStyles();
  return (
    <LandingSection
      title="Ce qu'il faut savoir sur Mobilic"
      titleProps={{ component: "h2" }}
    >
      <Grid
        container
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2 }}
      >
        <Grid
          item
          xs={12}
          container
          direction="column"
          spacing={4}
          alignItems="flex-start"
          style={{ textAlign: "justify", flexGrow: 100 }}
        >
          <Grid item>
            <Typography
              variant="h5"
              component="h3"
              className={classes.questionTitle}
            >
              Mobilic est-ce que ça fonctionne déjà ?
            </Typography>
            <Typography>
              Oui bien sûr ! Vous pouvez déjà utiliser Mobilic pour enregistrer
              le temps de travail. Le nom de domaine en “beta.gouv.fr” indique
              que Mobilic fait partie des startups d'État, des startups
              publiques développées au sein des Ministères publics.
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="h5"
              component="h3"
              className={classes.questionTitle}
            >
              Dois-je doublonner avec le LIC papier quand j’utilise Mobilic ?
            </Typography>
            <Typography>
              Non ! Mobilic permet de justifier du respect des exigences fixées
              dans les articles R. 3312-19 et R. 3312-58 du code des transports.
              Par ailleurs, dans le secteur du déménagement, un{" "}
              <a
                href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043023481"
                target="_blank"
                rel="noopener noreferrer"
              >
                arrêté spécifique
              </a>{" "}
              permet de justifier du respect du relevé hebdomadaire d’activité
              au moyen de Mobilic par dérogation à la présentation sous forme
              d’un carnet auto-carboné.{" "}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.faqCta}>
          <LinkButton
            to="https://faq.mobilic.beta.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            priority="primary"
          >
            Consulter la foire aux questions
          </LinkButton>
        </Grid>
      </Grid>
    </LandingSection>
  );
};
