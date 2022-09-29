import React from "react";
import { ControllerHelpCard } from "../home/ControllerHelpCard";
import Stack from "@mui/material/Stack";
import GavelIcon from "@mui/icons-material/Gavel";
import SvgIcon from "@mui/material/SvgIcon";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.primary.main
  }
}));

const getDSFRIconComponent = (iconName, classes) => (
  <span
    className={classNames(`${iconName} fr-icon--lg`, classes.icon)}
    aria-hidden="true"
  ></span>
);

export function HelpController() {
  const classes = useStyles();

  return (
    <Stack spacing={2}>
      <ControllerHelpCard
        iconComponent={
          <SvgIcon
            viewBox="0 0 20 20"
            className={classes.icon}
            component={GavelIcon}
          />
        }
        title="NATINF expliqués"
        description="Comprendre les codes associés aux seuils réglementaires"
        linkTo="https://mobilic.gitbook.io/natinf-expliques/"
      />
      <ControllerHelpCard
        iconComponent={getDSFRIconComponent("fr-icon-question-fill", classes)}
        title="FAQ"
        description="Trouvez les réponses à vos questions"
        linkTo="https://mobilic.gitbook.io/mobilic-faq-dediee-aux-corps-de-controle/"
      />
      <ControllerHelpCard
        iconComponent={getDSFRIconComponent(
          "fr-icon-git-repository-fill",
          classes
        )}
        title="Documentation"
        description="Comment utiliser Mobilic ?"
        linkTo="https://mobilic.beta.gouv.fr/resources/controller"
      />
      <ControllerHelpCard
        iconComponent={getDSFRIconComponent(
          "fr-icon-question-answer-line",
          classes
        )}
        title="Messagerie instantanée"
        description="Échangez avec l’équipe Mobilic et d’autres CTT sur notre forum Tchap !"
        linkTo="https://www.tchap.gouv.fr/#/room/%23SupportMobilicYNhe5wcTWWb:agent.dinum.tchap.gouv.fr"
      />
    </Stack>
  );
}
