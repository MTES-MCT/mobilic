import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { Breadcrumbs } from "@material-ui/core";
import { Link } from "../../common/LinkButton";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { RegulationCard } from "./RegulationCard";
import {
  LEGAL_ARTICLES,
  RegulationLegalArticleLink
} from "./RegulationLegalArticle";
import { DEFINITIONS } from "./RegulationDefinition";
import makeStyles from "@material-ui/core/styles/makeStyles";

export function Emphasis(props) {
  return (
    <span
      style={{
        fontWeight: "bold",
        whiteSpace: "nowrap",
        backgroundColor: "#ffee66"
      }}
      {...props}
    />
  );
}

export const REGULATION_RULES = {
  dailyWork: {
    name: "Durée du travail quotidien",
    rule: (
      <span>
        Le travail quotidien ne doit pas dépasser <Emphasis>12 heures</Emphasis>
        , ou dans le cas d'un travailleur de nuit <Emphasis>10 heures</Emphasis>
        .<br />
        <br />
        L'amplitude (temps de service) ne doit pas dépasser{" "}
        <Emphasis>14 heures</Emphasis>.
      </span>
    ),
    details: (
      <span>
        Sauf cas exceptionnel, le salarié ne peut pas travailler plus de{" "}
        <Emphasis>12 heures</Emphasis> dans l'amplitude journalière. <br />{" "}
        <br />
        L'amplitude est quant à elle limitée à <Emphasis>
          14 heures
        </Emphasis>{" "}
        car le salarié doit prendre au moins 10 heures consécutives de repos
        quotidien toutes les 24 heures.
        <br />
        <br />
        Si le salarié est un travailleur de nuit <strong>ou</strong> si une
        partie du travail de la journée s'effectue entre{" "}
        <Emphasis>minuit et 5 heures</Emphasis>, la durée maximale du travail
        est réduite à <Emphasis>10 heures</Emphasis> (
        <RegulationLegalArticleLink
          article={LEGAL_ARTICLES.dailyWorkDuringNight}
          shortLabel
        />
        ).
      </span>
    ),
    definitions: [
      DEFINITIONS.amplitude,
      DEFINITIONS.nightWork,
      DEFINITIONS.nightWorker
    ],
    articles: [
      LEGAL_ARTICLES.dailyWork,
      LEGAL_ARTICLES.dailyWorkDuringNight,
      LEGAL_ARTICLES.amplitude
    ],
    computation: (
      <span>
        Pour vérifier le respect de la règle Mobilic prend en compte le temps de
        travail total depuis le dernier repos journalier/hebdomadaire (au moins
        10 heures) avant la journée et le premier repos après.
        <br /> <br />
        Le temps de travail total peut donc éventuellement intégrer des
        activités du jour précédent ou du jour suivant. <br />
        <br />
        Dans le cas d'un repos journalier au milieu de la journée Mobilic divise
        le total en deux (avant et après le repos) et vérifie le respect sur
        chacune des durées.
      </span>
    )
  },
  dailyRest: {
    name: "Pause et repos quotidiens",
    rule: (
      <span>
        Le salarié ne peut pas travailler plus de{" "}
        <Emphasis>6 heures d'affilée</Emphasis> sans une pause.
        <br />
        <br />
        La pause doit être d'au-moins <Emphasis>30 minutes</Emphasis> si le
        travail quotidien est entre 6 heures et 9 heures et d'au-moins{" "}
        <Emphasis>45 minutes</Emphasis> si le temps de travail dépasse 9 heures.
        <br />
        <br />
        Le repos quotidien est d'au-moins{" "}
        <Emphasis>10 heures consécutives</Emphasis> toutes les 24 heures.
        <br />
        <br />
      </span>
    ),
    details: (
      <span>
        Le salarié doit prendre au-moins{" "}
        <Emphasis>10 heures consécutives</Emphasis> de repos sur toute période
        de 24 heures. <br />
        <br />
        Par ailleurs le salarié ne peut travailler plus de{" "}
        <Emphasis>6 heures d'affilée</Emphasis> sans prendre de pause.
        <br />
        <br />
        La durée minimale du temps de pause dépend du temps de travail de la
        journée (total calculé sur l'amplitude journalière) : <br />
        <ul>
          <li>
            en-dessous de 6 heures : pas d'obligation de prendre une pause
          </li>
          <li>
            entre 6 heures et 9 heures : au moins{" "}
            <Emphasis>30 minutes</Emphasis>
          </li>
          <li>
            au-delà de 9 heures : au moins <Emphasis>45 minutes</Emphasis>
          </li>
        </ul>
        La pause peut-être subdivisée en périodes d'au-moins 15 minutes.
      </span>
    ),
    definitions: [DEFINITIONS.amplitude],
    articles: [LEGAL_ARTICLES.break, LEGAL_ARTICLES.dailyRest],
    computation: (
      <span>
        Pour vérifier le respect de la règle Mobilic prend en compte toutes les
        activités depuis le dernier repos journalier/hebdomadaire (au moins 10
        heures) avant la journée et le premier repos après.
        <br /> <br />
        Il peut donc y avoir des activités du jour précédent ou du jour suivant.
        <br /> <br />
        Mobilic vérifie que l'amplitude totale des activités ne dépasse pas 14
        heures (pour assurer qu'il y a bien un repos de 10 heures toutes les 24
        heures) et vérifie le respect des temps de pauses en fonction du temps
        de travail total.
        <br />
        <br />
        En cas de repos journalier au milieu de la journée Mobilic effectue ces
        vérifications sur le groupe d'activités avant le repos et sur celui
        après.
      </span>
    )
  },
  weeklyWork: {
    name: "Durée du travail hebdomadaire",
    rule: (
      <span>
        En <strong>moyenne sur 3 ou 4 mois</strong> le travail hebdomadaire ne
        doit pas dépasser <Emphasis>44 heures </Emphasis> (messagerie et convoi
        de fonds) / <Emphasis>48 heures</Emphasis> (autres).
        <br />
        <br />
        Sur <strong>chaque</strong> semaine le travail ne doit pas dépasser{" "}
        <Emphasis>48 heures </Emphasis> (messagerie et convoi de fonds) /{" "}
        <Emphasis>56 heures</Emphasis> (longue distance) /{" "}
        <Emphasis>52 heures</Emphasis> (autres).
      </span>
    ),
    details: (
      <span>
        La durée du travail hebdomadaire, calculée sur la semaine civile, est
        limitée à deux niveaux : pour chaque semaine mais aussi en moyenne sur
        un trimestre ou un quadrimestre.
        <br /> <br />
        Les deux plafonds dépendent du type d'activité du salarié :
        <ul>
          <li style={{ marginBottom: 8 }}>
            longue distance
            <ul>
              <li>
                <Emphasis>56 heures</Emphasis> par semaine
              </li>
              <li>
                <Emphasis>48 heures</Emphasis> en moyenne sur 3 ou 4 mois
              </li>
            </ul>
          </li>
          <li style={{ marginBottom: 8 }}>
            messagerie et convoi de fonds
            <ul>
              <li>
                <Emphasis>48 heures</Emphasis> par semaine
              </li>
              <li>
                <Emphasis>44 heures</Emphasis> en moyenne sur 3 ou 4 mois
              </li>
            </ul>
          </li>
          <li style={{ marginBottom: 8 }}>
            autres (courte distance)
            <ul>
              <li>
                <Emphasis>52 heures</Emphasis> par semaine
              </li>
              <li>
                <Emphasis>48 heures</Emphasis> en moyenne
              </li>
            </ul>
          </li>
        </ul>
        Les trimestres et quadrimestres utilisés pour le calcul des moyennes
        sont les trimestres civils (janvier-mars, avril-juin, juillet-septembre,
        octobre-décembre) et quadrimestres civils (janvier-avril, mai-août,
        septembre-décembre).
      </span>
    ),
    definitions: [DEFINITIONS.longDistance],
    articles: [LEGAL_ARTICLES.weeklyWork]
  },
  weeklyRest: {
    name: "Repos hebdomadaire",
    rule: (
      <span>
        Au moins un jour de la semaine civile doit être{" "}
        <Emphasis>complètement non travaillé</Emphasis> (de 0h à 24h).
        <br />
        <br />
        De plus le repos hebdomadaire est d'au-moins{" "}
        <Emphasis>34 heures</Emphasis>.
      </span>
    ),
    details: (
      <span>
        Au moins un jour de la semaine civile doit être{" "}
        <Emphasis>complètement non travaillé</Emphasis> (de 0h à 24h).
        <br />
        <br />
        Le repos hebdomadaire est au minimum de 24 heures + la durée d'un repos
        quotidien, soit <Emphasis>34 heures</Emphasis>.
      </span>
    ),
    articles: [LEGAL_ARTICLES.weeklyRest1, LEGAL_ARTICLES.weeklyRest2],
    computation: (
      <span>
        Pour vérifier le respect de la règle Mobilic considère toutes les
        activités de la semaine et s'assure qu'il y a au moins un jour sans
        aucune activité entre 0h00 et 23h59.
        <br />
        <br />
        Mobilic vérifie également qu'au-moins 34 heures se sont écoulées entre
        la dernière activité de la semaine précédente et la première activité de
        la semaine, ou alors qu'un repos d'au-moins 34 heures a été pris au
        milieu de la semaine. <br />
        <br />
      </span>
    )
  },
  nightBonus: {
    name: "Primes de nuit",
    rule: (
      <span>
        Toute heure travaillée entre <Emphasis>21 heures et 6 heures</Emphasis>{" "}
        donne droit à une prime.
        <br />
        <br />
        Au-delà de <Emphasis>50 heures sur un mois</Emphasis> le salarié a le
        droit à un repos compensateur.
      </span>
    ),
    details: (
      <span>
        Toute heure travaillée entre <Emphasis>21 heures et 6 heures</Emphasis>{" "}
        donne droit à une prime égale à 20% d'un taux horaire de référence
        (associé au coefficient 150M).
        <br />
        <br />
        Si le temps de travail effectué entre 21 heures et 6 heures dépasse{" "}
        <Emphasis>50 heures sur le mois</Emphasis>, le salarié a le droit à un{" "}
        <Emphasis>repos compensateur</Emphasis> d'une durée égale à 5% de ce
        temps de travail.
      </span>
    ),
    articles: [LEGAL_ARTICLES.nightBonus]
  },
  holidays: {
    name: "Dimanches et jours fériés",
    rule: (
      <span>
        Les heures travaillées pendant un dimanche ou un jour férié sont
        rémunérées <Emphasis>avec majoration</Emphasis>.<br />
        <br />
        Le taux de majoration n'est pas le même suivant que le temps de travai
        dépasse ou non <Emphasis>3 heures</Emphasis>.
      </span>
    ),
    details: (
      <span>
        Les heures travaillées pendant un dimanche ou un jour férié sont
        rémunérées <Emphasis>avec majoration</Emphasis>.<br />
        <br />
        Le taux de majoration n'est pas le même suivant que le temps de travai
        dépasse ou non <Emphasis>3 heures</Emphasis>.
      </span>
    )
  }
};

const useStyles = makeStyles(theme => ({
  ruleScope: {
    fontStyle: "italic",
    display: "block",
    marginBottom: theme.spacing(2)
  }
}));

export function RegulationPage() {
  const classes = resourcePagesClasses();

  const otherClasses = useStyles();

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Breadcrumbs>
          <Link color="inherit" to="/resources/home">
            Documentation
          </Link>
          <Typography>Réglementation</Typography>
        </Breadcrumbs>
        <PaperContainerTitle variant="h1" className={classes.title}>
          La réglementation du temps de travail dans le transport routier léger
        </PaperContainerTitle>
        <Typography variant="caption" className={otherClasses.ruleScope}>
          Les règles suivantes concernent le personnel roulant soumis au livret
          individuel de contrôle et ne sont pas forcément applicables aux autres
          personnels des entreprises de transport routier. Par ailleurs les
          dérogations ou règles propres à chaque secteur (déménagement,
          messagerie, ...) ne sont pas précisées.
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={6}>
          {Object.values(REGULATION_RULES).map((rule, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <RegulationCard rule={rule} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}
