import React from "react";
import { WhatsMobilicCard } from "./WhatsMobilicCard";
import Stack from "@mui/material/Stack";

const CARDS = [
  {
    id: "what_is_mobilic",
    title: "Qu'est-ce que Mobilic ?",
    content:
      "Une application et une API de saisie et de suivi du temps de travail dans le transport routier léger développée par le ministère chargé des Transports.",
    link:
      "https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
  },
  {
    id: "which_companies",
    title: "Quelles sont les entreprises concernées par Mobilic ?",
    content:
      "Toutes les entreprises de transport routier léger de marchandises (-3,5 tonnes) et de personnes (- 9 places), et le secteur du déménagement.",
    link:
      "https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
  },
  {
    id: "is_mobilic_mandatory",
    title: "L’utilisation de Mobilic est-elle obligatoire ?",
    content:
      "Actuellement, le suivi du temps de travail est obligatoire dans le transport routier léger et peut se faire à l’aide du livret individuel de contrôle (LIC) ou Mobilic. Le LIC est voué à disparaître.",
    link:
      "https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/securite-et-confidentialite-des-donnees"
  },
  {
    id: "do_i_need_mobilic",
    title:
      "J’utilise déjà un logiciel de gestion, dois-je passer sur Mobilic ?",
    content:
      "Oui car les autres logiciels ne remplacent pas Mobilic. Pour ne pas multiplier le nombre d’outils utilisés par les salariés, vous pouvez interfacer Mobilic à votre logiciel.",
    link:
      "https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/autoriser-lacces-a-un-logiciel-tiers"
  }
];

export function WhatsMobilic() {
  return (
    <Stack direction="row" flexWrap="wrap" gap={4} justifyContent="center">
      {CARDS.map(({ id, title, content, link }) => (
        <WhatsMobilicCard
          key={id}
          id={id}
          title={title}
          content={content}
          link={link}
        />
      ))}
    </Stack>
  );
}
