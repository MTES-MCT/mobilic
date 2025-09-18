import { Stack, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";
import { ExternalLink } from "../../../common/ExternalLink";

export const certificateStyles = makeStyles(theme => ({
  subtitle: {
    fontWeight: "bold"
  },
  list: {
    paddingLeft: theme.spacing(3),
    textAlign: "justify",
    margin: 0
  }
}));

const getSubtitle = (medal, isCertified) => {
  if (!isCertified) {
    return "Vous pouvez obtenir le niveau bronze !";
  }
  if (medal === "BRONZE") {
    return "Vous êtes sur la bonne voie !";
  }
  if (medal === "SILVER") {
    return "Vous pouvez faire encore mieux !";
  }
  if (medal === "GOLD") {
    return "Vous y êtes presque !";
  }
};

const ITEMS_NOT_CERTIFIED = (
  <>
    <li>
      Aidez vos salariés à prendre en main Mobilic en leur fournissant de la{" "}
      <ExternalLink url="/resources/driver" text="documentation" />
      &nbsp;;
    </li>
    <li>
      Demandez aux salariés à l'aise avec l'outil de prendre le temps de former
      les autres&nbsp;;
    </li>
    <li>
      Expliquez-leur l'importance de saisir en temps réel&nbsp;: respect des
      seuils réglementaires, respect du droit du travail&nbsp;;
    </li>
    <li>
      L'équipe Mobilic est disponible en visioconférence pour plus de conseils :{" "}
      <ExternalLink
        url="https://calendly.com/kelly-heau-mobilic/30min?month=2025-06"
        text="prendre rendez-vous"
      />
      .
    </li>
  </>
);

const ITEMS_MEDALS = {
  BRONZE: (
    <>
      <li>Formez vos salariés à l’usage de Mobilic&nbsp;;</li>
      <li>
        Assurez-vous en début de journée qu’ils aient bien lancé Mobilic
        (information vérifiable depuis l’onglet “Activités” de votre
        espace)&nbsp;;
      </li>
      <li>
        Renseignez-vous sur{" "}
        <ExternalLink
          url="https://mobilic.beta.gouv.fr/resources/regulations"
          text="la réglementation en vigueur"
        />
        .
      </li>
    </>
  ),
  SILVER: (
    <>
      <li>
        Expliquez à vos salariés pourquoi il est dans leur intérêt de saisir en
        temps réel&nbsp;;
      </li>
      <li>
        En fin de journée, assurez-vous qu’ils mettent bien fin à leur mission
        en cours&nbsp;;
      </li>
      <li>Formez-les au respect des seuils réglementaires. </li>
    </>
  ),
  GOLD: (
    <>
      <li>
        Chaque fois que vous communiquez avec vos salariés dans la journée,
        demandez-leur s’ils ont bien mis à jour Mobilic&nbsp;;
      </li>
      <li>
        Réservez la modification des missions aux oublis ou aux erreurs des
        salariés&nbsp;;
      </li>
      <li>
        Identifiez les critères manquants et mettez en place une procédure
        spécifique pour y remédier.
      </li>
    </>
  )
};

export function CertificationAdvices({ medal, isCertified }) {
  const classes = certificateStyles();

  if (medal === "DIAMOND") {
    return null;
  }

  return (
    <Stack gap={2}>
      <Typography component="h2" variant="h5">
        {isCertified
          ? "Comment passer au niveau suivant ?"
          : "Comment obtenir le premier niveau ?"}
      </Typography>
      <Typography className={classes.subtitle} mb={0}>
        {getSubtitle(medal, isCertified)}
      </Typography>
      <ul className={classes.list}>
        {!isCertified ? ITEMS_NOT_CERTIFIED : ITEMS_MEDALS[medal]}
      </ul>
    </Stack>
  );
}
