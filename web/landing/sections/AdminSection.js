import React from "react";
import { OuterContainer } from "../components/OuterContainer";
import { InnerContainer } from "../components/InnerContainer";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Button } from "@codegouvfr/react-dsfr/Button";
import AdminSvg from "common/assets/images/landing/self-training.svg";
import SoftwareSvg from "common/assets/images/landing/flow-settings.svg";
import { Box } from "@mui/material";
import { LinkButton } from "../../common/LinkButton";

const useStyles = makeStyles((theme) => ({
  linkButton: {
    textDecoration: "underline",
    textUnderlineOffset: "6px",
  },
  highlightedText: {
    color: "#3965EA",
  },
}));

const ImageContainer = (url) => (
  <Box height="156px">
    <img src={url} style={{ margin: "auto" }} />
  </Box>
);

export function AdminSection() {
  const classes = useStyles();

  return (
    <OuterContainer>
      <InnerContainer>
        <Typography variant="h3" component="h2" mb={{ xs: 4, sm: 6 }}>
          Je suis <span className={classes.highlightedText}>gestionnaire</span>,
          comment démarrer avec Mobilic ?
        </Typography>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          gap={2}
          justifyContent="space-between"
          alignItems="center"
          columnGap={4}
        >
          <Card
            background
            desc={
              <ul>
                <li>Je crée mon compte Mobilic</li>
                <li>
                  J’invite mes salariés et ils saisissent leur temps de travail
                </li>
                <li>
                  Je suis les temps de travail de mes salariés depuis mon espace
                  Mobilic et je les valide
                </li>
              </ul>
            }
            imageAlt="J’utilise Mobilic directement"
            imageComponent={ImageContainer(AdminSvg)}
            size="medium"
            title="J’utilise Mobilic directement"
            titleAs="h3"
            footer={
              <LinkButton
                priority="primary"
                size="medium"
                to="https://mobilic.beta.gouv.fr/signup/role_selection"
                target="_blank"
                rel="noopener noreferrer"
              >
                Créer mon espace Mobilic
              </LinkButton>
            }
            className="blue"
            style={{ maxWidth: "565px" }}
          />
          <Typography
            color="#161616"
            variant="h4"
            component="div"
            fontSize="1.5rem"
          >
            ou
          </Typography>
          <Card
            background
            desc={
              <ul>
                <li>Je crée mon compte Mobilic</li>
                <li>J'interconnecte mon logiciel métier avec Mobilic</li>
                <li>
                  Les saisies sur mon logiciel métier sont automatiquement
                  synchronisées (pas de double saisie)
                </li>
              </ul>
            }
            imageAlt="J’utilise un logiciel métier interconnecté"
            imageComponent={ImageContainer(SoftwareSvg)}
            footer={
              <LinkButton
                priority="primary"
                size="medium"
                to="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/substituer-mobilic-avec-un-logiciel-metier-interconnexion"
                target="_blank"
                rel="noopener noreferrer"
              >
                Me renseigner
              </LinkButton>
            }
            size="medium"
            title="J’utilise un logiciel métier interconnecté"
            titleAs="h3"
            className="green"
            style={{ maxWidth: "565px" }}
          />
        </Stack>
      </InnerContainer>
    </OuterContainer>
  );
}
