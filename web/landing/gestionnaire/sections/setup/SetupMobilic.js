import React from "react";
import { makeStyles } from "@mui/styles";
import { SetupMobilicBlock } from "./SetupMobilicBlock";
import Stack from "@mui/material/Stack";
import { useIsWidthUp } from "common/utils/useWidth";
import { Link, LinkButton } from "../../../../common/LinkButton";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ADMIN_LANDING_SUBSCRIBE_HOW_TO } from "common/utils/matomoTags";

const BLOCKS = [
  {
    index: "1",
    when: "Aujourd'hui",
    title:
      "Vous invitez vos salariés à rejoindre Mobilic et rattachez leur compte à votre entreprise",
    content:
      "L'application mobile intuitive permet à vos salariés une prise en main rapide et une utilisation quotidienne."
  },
  {
    index: "2",
    when: "15 jours plus tard",
    title:
      "Vos salariés lancent Mobilic au quotidien, vous récupérez les temps de travail dans votre interface",
    content: (
      <>
        Vous <b>utilisez Mobilic de manière conforme</b> et gagnez 15 minutes de
        gestion administrative par salarié et par semaine.
      </>
    )
  },
  {
    index: "3",
    when: "1 mois plus tard",
    title: (
      <>
        Vous obtenez{" "}
        <Link
          href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic"
          target="_blank"
          rel="noopener noreferrer"
        >
          le certificat
        </Link>{" "}
        grâce à votre utilisation conforme de Mobilic et l'affichez publiquement
      </>
    ),
    content:
      "Les donneurs d'ordre, les salariés et les clients potentiels savent que vous respectez la réglementation de suivi du temps de travail."
  }
];

const useStyles = makeStyles(theme => ({
  button: {
    margin: "auto"
  }
}));

export function SetupMobilic() {
  const isOnDesktop = useIsWidthUp("md");
  const { trackEvent } = useMatomo();

  const classes = useStyles();

  const BLOCKS_WITH_DIVIDERS = React.useMemo(() => {
    const blocks = BLOCKS.map(({ index, when, title, content }) => (
      <SetupMobilicBlock
        key={index}
        index={index}
        when={when}
        title={title}
        content={content}
      />
    ));

    return blocks;
  }, []);
  return (
    <Stack direction="column" gap={4}>
      <Stack
        direction={isOnDesktop ? "row" : "column"}
        justifyContent="space-around"
        alignItems={isOnDesktop ? "flex-start" : "center"}
        gap={4}
      >
        {BLOCKS_WITH_DIVIDERS}
      </Stack>
      <LinkButton
        className={classes.button}
        priority="primary"
        to="/signup/admin"
        onClick={() => trackEvent(ADMIN_LANDING_SUBSCRIBE_HOW_TO)}
      >
        Je crée mon compte gratuit
      </LinkButton>
    </Stack>
  );
}
