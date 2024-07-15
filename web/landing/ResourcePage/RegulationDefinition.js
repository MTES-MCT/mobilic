import React from "react";
import {
  LEGAL_ARTICLES,
  RegulationLegalArticleLink
} from "./RegulationLegalArticle";
import { Emphasis } from "./Emphasis";

export const DEFINITIONS = {
  amplitude: {
    name: "Amplitude (temps de service)",
    content: (
      <span>
        période entre deux repos quotidiens/hebdomadaires consécutifs (repos
        d'au moins 10 heures). Inclut donc les heures travaillées mais aussi les
        pauses ou repos inférieurs à 10 heures.
      </span>
    )
  },
  nightWorker: {
    name: "Travailleur de nuit",
    content: (
      <span>
        salarié qui effectue :
        <ul>
          <li>
            au moins <Emphasis>3 heures</Emphasis> de travail de nuit au moins{" "}
            <Emphasis>2 fois par semaine</Emphasis> (
            <RegulationLegalArticleLink
              article={LEGAL_ARTICLES.nightWorker1}
              shortLabel
            />
            )
          </li>
          <li style={{ listStyleType: "none", marginTop: 8, marginBottom: 8 }}>
            <strong>OU</strong>
          </li>
          <li>
            au moins <Emphasis>270 heures</Emphasis> de travail de nuit sur les{" "}
            <Emphasis>12 derniers mois</Emphasis> (
            <RegulationLegalArticleLink
              article={LEGAL_ARTICLES.nightWorker2}
              shortLabel
            />
            )
          </li>
        </ul>
      </span>
    )
  },
  longDistance: {
    name: "Longue distance",
    content: (
      <span>
        lorsque le salarié effectue au moins 6 découchers par mois (hors
        déménagement) ou 40 découchers par an (pour le secteur du déménagement)
        (article{" "}
        <RegulationLegalArticleLink
          article={LEGAL_ARTICLES.longDistance}
          shortLabel
        />{" "}
        du Code des transports).
      </span>
    )
  },
  calendarWeek: {
    name: "Semaine civile",
    content: (
      <span>
        elle débute le lundi à 0 heure et se termine le dimanche à 24 heures.
        (article{" "}
        <RegulationLegalArticleLink
          article={LEGAL_ARTICLES.calendarWeek}
          shortLabel
        />{" "}
        du Code du travail).
      </span>
    )
  }
};
