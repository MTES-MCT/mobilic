import React from "react";
import {
  LEGAL_ARTICLES,
  RegulationLegalArticleLink
} from "./RegulationLegalArticle";
import { DEFINITIONS } from "./RegulationDefinition";
import { Emphasis } from "./Emphasis";

export const REGULATION_RULES = {
  dailyWork: {
    url: "duree-travail-quotidien",
    name: "Durée du travail quotidien",
    rule: (
      <>
        <p>
          Transport routier de marchandises&nbsp;: le travail quotidien ne doit
          pas dépasser <Emphasis>12 heures</Emphasis> ou, dans le cas d'un
          travailleur de nuit, <Emphasis>10 heures</Emphasis>.
        </p>
        <p>
          Transport routier de voyageurs&nbsp;: le travail quotidien ne doit pas
          dépasser <Emphasis>10 heures</Emphasis>, même en cas de travail de
          nuit.
        </p>
        <p>
          L'amplitude (temps de service) ne doit pas dépasser{" "}
          <Emphasis>14 heures</Emphasis>.
        </p>
      </>
    ),
    details: (
      <>
        <p>
          En transport routier de marchandises (TRM), le salarié ne peut pas
          travailler plus de <Emphasis>12 heures</Emphasis> dans l'amplitude
          journalière.
        </p>
        <p>
          En transport routier de voyageurs (TRV), le travail quotidien ne doit
          pas dépasser <Emphasis>10 heures</Emphasis>. Dans le cas de TRV lignes
          régulières ou de T3P (taxis, VTC, LOTI), la durée maximale de travail
          quotidien passe à <Emphasis>9 heures</Emphasis> si l'amplitude de la
          journée est respectivement{" "}
          <Emphasis>supérieure à 13 heures ou à 12 heures</Emphasis>.
        </p>
        <p>
          En TRM comme en TRV, l'amplitude est quant à elle limitée à{" "}
          <Emphasis>14 heures</Emphasis> car le salarié doit prendre au moins 10
          heures consécutives de repos quotidien sur toute période de 24 heures.
        </p>
        <p>
          Si le salarié est un travailleur de nuit ou si une partie du travail
          de la journée s'effectue entre <Emphasis>minuit et 5 heures</Emphasis>
          , la durée maximale du travail est réduite à{" "}
          <Emphasis>10 heures</Emphasis> (
          <RegulationLegalArticleLink
            article={LEGAL_ARTICLES.dailyWorkDuringNight}
            shortLabel
          />
          ).
        </p>
      </>
    ),
    definitions: [DEFINITIONS.amplitude, DEFINITIONS.nightWorker],
    articles: {
      "Transport routier de marchandises": [LEGAL_ARTICLES.dailyWorkTRM],
      "Transport routier de voyageurs": [
        LEGAL_ARTICLES.dailyWorkTRV1,
        LEGAL_ARTICLES.dailyWorkTRV2,
        LEGAL_ARTICLES.dailyWorkTRV3,
        LEGAL_ARTICLES.dailyWorkTRV4
      ],
      Transverses: [
        LEGAL_ARTICLES.dailyWorkDuringNight,
        LEGAL_ARTICLES.amplitude
      ]
    },
    computation: (
      <>
        <p>
          Pour vérifier le respect de la règle Mobilic prend en compte le temps
          de travail total depuis le dernier repos journalier/hebdomadaire (au
          moins 10 heures) avant la journée et le premier repos après.
        </p>
        <p>
          Le temps de travail total peut donc éventuellement intégrer des
          activités du jour précédent ou du jour suivant.
        </p>
        <p>
          Dans le cas d'un repos journalier au milieu de la journée Mobilic
          divise le total en deux (avant et après le repos) et vérifie le
          respect sur chacune des durées.
        </p>
      </>
    )
  },
  dailyRest: {
    url: "pause-et-repos-quotidiens",
    name: "Pause et repos quotidiens",
    rule: (
      <>
        <p>
          Le salarié ne peut pas travailler{" "}
          <Emphasis>plus de 6 heures d’affilée</Emphasis> sans prendre de pause.
        </p>
        <p>
          Cette pause doit intervenir au plus tard au bout de 6 heures de
          travail ininterrompu et durer au moins&nbsp;:
        </p>
        <ul style={{ fontSize: "1rem" }}>
          <li>
            <Emphasis>30 minutes</Emphasis> lorsque le total des heures
            travaillées est compris entre 6 et 9 heures,
          </li>
          <li>
            <Emphasis>45 minutes</Emphasis> au-delà de 9 heures de travail par
            jour.
          </li>
        </ul>
        <p>
          Le repos quotidien est d'au moins{" "}
          <Emphasis>10 heures consécutives</Emphasis> dans les 24 heures suivant
          le début d'une journée de travail.
        </p>
      </>
    ),
    details: (
      <>
        <p>
          Le salarié doit prendre au moins{" "}
          <Emphasis>10 heures de repos consécutives</Emphasis> dans les 24
          heures suivant le début d'une journée de travail.
        </p>
        <p>
          Exemple&nbsp;: si le conducteur commence sa journée de travail à 7h le
          lundi, il devra obligatoirement avoir pris 10 heures de repos
          consécutives avant 7h le mardi.
        </p>
        <p>
          Par ailleurs, le salarié ne peut travailler{" "}
          <Emphasis>plus de 6 heures d'affilée</Emphasis> sans prendre de pause.
        </p>
        <p>
          La pause doit intervenir au plus tard au bout de 6 heures de travail
          ininterrompu et sa durée minimale dépend du temps de travail de la
          journée (total calculé sur l'amplitude journalière)&nbsp;:
        </p>
        <ul>
          <li>
            entre 6 heures et 9 heures&nbsp;: au moins{" "}
            <Emphasis>30 minutes</Emphasis>
          </li>
          <li>
            au-delà de 9 heures&nbsp;: au moins <Emphasis>45 minutes</Emphasis>
          </li>
        </ul>
        <p>La pause peut être subdivisée en périodes d'au moins 15 minutes.</p>
        <p>
          Ces dispositions concernent le transport routier de marchandises comme
          le transport routier de voyageurs.
        </p>
      </>
    ),
    definitions: [DEFINITIONS.amplitude],
    articles: [LEGAL_ARTICLES.break, LEGAL_ARTICLES.dailyRest],
    computation: (
      <>
        <p>
          Pour vérifier le respect de la règle Mobilic prend en compte toutes
          les activités depuis le dernier repos journalier/hebdomadaire (au
          moins 10 heures) avant la journée et le premier repos après.
        </p>
        <p>
          Il peut donc y avoir des activités du jour précédent ou du jour
          suivant.
        </p>
        <p>
          Mobilic vérifie que l'amplitude totale des activités ne dépasse pas 14
          heures (pour assurer qu'il y a bien un repos de 10 heures toutes les
          24 heures) et vérifie le respect des temps de pauses en fonction du
          temps de travail total.
        </p>
        <p>
          En cas de repos journalier au milieu de la journée Mobilic effectue
          ces vérifications sur le groupe d'activités avant le repos et sur
          celui après.
        </p>
      </>
    )
  },
  weeklyWork: {
    url: "duree-travail-hebdomadaire",
    name: "Durée du travail hebdomadaire",
    rule: (
      <>
        <p>
          La durée du travail hebdomadaire, calculée sur la semaine civile, est
          limitée à deux niveaux&nbsp;: <Emphasis>pour chaque semaine</Emphasis>{" "}
          mais aussi{" "}
          <Emphasis whiteSpace="normal">
            en moyenne sur un trimestre ou un quadrimestre
          </Emphasis>
          .
        </p>
        <p>
          Ces plafonds dépendent du type d'activité des salariés. Veuillez
          cliquer sur la vignette pour accéder au détail.
        </p>
      </>
    ),
    details: (
      <>
        <h6>
          Durée maximale de travail hebdomadaire sur une semaine civile
          isolée&nbsp;:
        </h6>
        <ul>
          <li>
            Transport routier de marchandises&nbsp;:
            <ul>
              <li>
                Longue distance&nbsp;: <Emphasis>56 heures</Emphasis>
              </li>
              <li>
                Courte distance&nbsp;: <Emphasis>52 heures</Emphasis>
              </li>
              <li>
                Messagerie, Fonds et valeurs&nbsp;:{" "}
                <Emphasis>48 heures</Emphasis>
              </li>
            </ul>
          </li>
          <li style={{ paddingTop: 16 }}>
            Transport routier de voyageurs&nbsp;:
            <ul>
              <li>
                Occasionnel&nbsp;: <Emphasis>48 heures</Emphasis>
              </li>
              <li>
                Lignes régulières&nbsp;: <Emphasis>48 heures</Emphasis>
              </li>
              <li>
                T3P (taxis, VTC, LOTI)&nbsp;: <Emphasis>48 heures</Emphasis>
              </li>
            </ul>
          </li>
        </ul>
        <h6>Durée maximale de travail hebdomadaire moyenne&nbsp;:</h6>
        <ul>
          <li>
            Transport routier de marchandises (par semaine en moyenne sur une
            période de 3 ou 4 mois)&nbsp;:
            <ul>
              <li>
                Longue distance&nbsp;: <Emphasis>53 heures</Emphasis>
              </li>
              <li>
                Courte distance&nbsp;: <Emphasis>50 heures</Emphasis>
              </li>
              <li>
                Messagerie, Fonds et valeurs&nbsp;:{" "}
                <Emphasis>44 heures</Emphasis>
              </li>
            </ul>
            <span>
              Les trimestres et quadrimestres utilisés pour le calcul des
              moyennes sont les trimestres civils (janvier-mars, avril-juin,
              juillet-septembre, octobre-décembre) et quadrimestres civils
              (janvier-avril, mai-août, septembre-décembre).
            </span>
          </li>
          <li style={{ paddingTop: 16 }}>
            Transport routier de voyageurs (par semaine en moyenne sur une
            période de 12 semaines)&nbsp;:
            <ul>
              <li>
                Occasionnel&nbsp;: <Emphasis>44 heures</Emphasis>
              </li>
              <li>
                Lignes régulières&nbsp;: <Emphasis>44 heures</Emphasis>
              </li>
              <li>
                T3P (taxis, VTC, LOTI)&nbsp;: <Emphasis>44 heures</Emphasis>
              </li>
            </ul>
          </li>
        </ul>
      </>
    ),
    definitions: [DEFINITIONS.calendarWeek, DEFINITIONS.longDistance],
    articles: {
      "Transport routier de marchandises": [LEGAL_ARTICLES.weeklyWorkTRM],
      "Transport routier de voyageurs": [
        LEGAL_ARTICLES.weeklyWorkTRV1,
        LEGAL_ARTICLES.weeklyWorkTRV2
      ]
    }
  },
  weeklyRest: {
    url: "repos-hebdomadaire",
    name: "Repos hebdomadaire",
    rule: (
      <>
        <p>
          Au moins un jour de la semaine civile doit être{" "}
          <Emphasis>complètement non travaillé</Emphasis> (de 0h à 24h).
        </p>
        <p>
          De plus le repos hebdomadaire est d'au moins{" "}
          <Emphasis>34 heures</Emphasis>.
        </p>
      </>
    ),
    details: (
      <>
        <p>
          Au moins un jour de la semaine civile doit être{" "}
          <Emphasis>complètement non travaillé</Emphasis> (de 0h à 24h).
        </p>
        <p>
          Le repos hebdomadaire est au minimum de 24 heures + la durée d'un
          repos quotidien, soit <Emphasis>34 heures</Emphasis>.
        </p>
        <p>
          Ces dispositions concernent le transport routier de marchandises comme
          le transport routier de voyageurs.
        </p>
      </>
    ),
    definitions: [DEFINITIONS.calendarWeek],
    articles: [LEGAL_ARTICLES.weeklyRest1, LEGAL_ARTICLES.weeklyRest2],
    computation: (
      <>
        <p>
          Pour vérifier le respect de la règle Mobilic considère toutes les
          activités de la semaine et s'assure qu'il y a au moins un jour sans
          aucune activité entre 0h00 et 23h59.
        </p>
        <p>
          Mobilic vérifie également qu'au moins 34 heures se sont écoulées entre
          la dernière activité de la semaine précédente et la première activité
          de la semaine, ou alors qu'un repos d'au moins 34 heures a été pris au
          milieu de la semaine.
        </p>
      </>
    )
  },
  nightBonus: {
    url: "primes-de-nuit",
    name: "Primes de nuit",
    rule: (
      <>
        <p>
          Toute heure travaillée entre{" "}
          <Emphasis>21 heures et 6 heures</Emphasis> donne droit à une prime.
        </p>
        <p>
          Au-delà de <Emphasis>50 heures sur un mois</Emphasis> le salarié a le
          droit à un repos compensateur.
        </p>
      </>
    ),
    details: (
      <>
        <p>
          Toute heure travaillée entre{" "}
          <Emphasis>21 heures et 6 heures</Emphasis> donne droit à une prime
          égale à 20% d'un taux horaire de référence (associé au coefficient
          150M).
        </p>
        <p>
          Si le temps de travail effectué entre 21 heures et 6 heures dépasse{" "}
          <Emphasis>50 heures sur le mois</Emphasis>, le salarié a le droit à un{" "}
          <Emphasis>repos compensateur</Emphasis> d'une durée égale à 5% de ce
          temps de travail.
        </p>
        <p>
          Ces dispositions relèvent d’un accord conventionnel et ne sont donc
          pas applicables à l’ensemble des entreprises. Les salariés sont
          invités à se rapprocher de leur gestionnaire pour s’assurer qu’ils en
          bénéficient.
        </p>
      </>
    ),
    articles: [LEGAL_ARTICLES.nightBonus]
  },
  holidays: {
    url: "dimanches-et-jours-feries",
    name: "Dimanches et jours fériés",
    rule: (
      <>
        <p>
          Selon l'ancienneté, les heures travaillées pendant un dimanche ou un
          jour férié sont rémunérées <Emphasis>avec majoration</Emphasis> ou au
          moyen <Emphasis>d'une prime forfaitaire</Emphasis>.
        </p>
        <p>
          Le montant de la prime n'est pas le même suivant que le temps de
          travail dépasse ou non <Emphasis>3 heures</Emphasis>.
        </p>
      </>
    ),
    details: (
      <>
        <p>
          Selon l'ancienneté, les heures travaillées pendant un dimanche ou un
          jour férié sont rémunérées <Emphasis>avec majoration</Emphasis> ou au
          moyen <Emphasis>d'une prime forfaitaire</Emphasis>.
        </p>
        <p>
          Le montant de la prime n'est pas le même suivant que le temps de
          travail dépasse ou non <Emphasis>3 heures</Emphasis>.
        </p>
        <p>
          Ces dispositions concernent le transport routier de marchandises comme
          le transport routier de voyageurs.
        </p>
      </>
    )
  }
};
