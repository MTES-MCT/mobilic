import React from "react";
import { makeStyles } from "@mui/styles";
import { SetupMobilicBlock } from "./SetupMobilicBlock";
import Stack from "@mui/material/Stack";
import { useIsWidthUp } from "common/utils/useWidth";
import { Link } from "../../../../common/LinkButton";
import { LoadingButton } from "common/components/LoadingButton";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ADMIN_LANDING_SUBSCRIBE_HOW_TO } from "common/utils/matomoTags";

const BLOCKS = [
  {
    index: "1",
    when: "Aujourd'hui",
    title:
      "Vous invitez vos salariés à rejoindre Mobilic et rattachez leur compte à votre entreprise",
    content:
      "L'application mobile intuitive permet à vos salariés une prise en main rapide et une utilisation quotidienne"
  },
  {
    index: "2",
    when: "15 jours plus tard",
    title:
      "Vos salariés lancent Mobilic au quotidien, vous récupérez les temps de travail dans votre interface",
    content:
      "Vous utilisez Mobilic de manière conforme et gagnez 15 minutes de gestion administrative par salarié et par semaine"
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
      "Les donneurs d'ordre, les salariés et les clients potentiels savent que vous respectez la réglementation de suivi du temps de travail"
  }
];

const useStyles = makeStyles(theme => ({
  dividerContainer: {
    position: "relative"
  },
  divider: {
    backgroundColor: theme.palette.primary.main,
    [theme.breakpoints.down("md")]: {
      display: "none"
    },
    minWidth: theme.spacing(18),
    height: "4px",
    position: "absolute",
    top: "128px",
    left: "-76px",
    "&::before, &::after": {
      content: '""',
      backgroundColor: theme.palette.primary.main,
      display: "inline-block",
      height: "20px",
      width: "20px",
      borderRadius: "50%",
      position: "absolute",
      top: "-8px"
    },
    "&::before": {
      left: 0
    },
    "&::after": {
      right: 0
    }
  },
  button: {
    margin: "auto"
  }
}));

export function SetupMobilic() {
  const isOnDesktop = useIsWidthUp("md");
  const { trackEvent } = useMatomo();

  const classes = useStyles();

  const Divider = index => (
    <div className={classes.dividerContainer} key={`divider_${index}`}>
      <div className={classes.divider} />
    </div>
  );

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

    // insert dividers
    return blocks.reduce(
      (arr, item, index) =>
        index < blocks.length - 1
          ? arr.concat([item, Divider(index)])
          : arr.concat(item),
      []
    );
  }, []);
  return (
    <Stack direction="column" gap={8}>
      <Stack
        direction={isOnDesktop ? "row" : "column"}
        justifyContent="space-around"
        alignItems={isOnDesktop ? "flex-start" : "center"}
        gap={4}
      >
        {BLOCKS_WITH_DIVIDERS}
      </Stack>
      <LoadingButton
        variant="contained"
        color="primary"
        className={classes.button}
        href="/signup/admin"
        onClick={() => trackEvent(ADMIN_LANDING_SUBSCRIBE_HOW_TO)}
      >
        Je crée mon compte gratuit
      </LoadingButton>
    </Stack>
  );
}
