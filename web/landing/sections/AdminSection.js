import React from "react";
import { OuterContainer } from "../components/OuterContainer";
import { InnerContainer } from "../components/InnerContainer";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles((theme) => ({
  linkButton: {
    textDecoration: "underline",
    textUnderlineOffset: "6px",
  },
  highlightedText: {
    color: "#3965EA",
  },
}));

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
            // desc="Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et"
            enlargeLink
            imageAlt="texte alternatif de l’image"
            imageUrl="https://www.systeme-de-design.gouv.fr/v1.14/storybook/img/placeholder.16x9.png"
            linkProps={{
              href: "#",
            }}
            size="medium"
            title="J’utilise Mobilic directement"
            titleAs="h3"
            footer={<Button>Créer mon espace Mobilic</Button>}
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
            border
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
            enlargeLink
            imageAlt="texte alternatif de l’image"
            imageUrl="https://www.systeme-de-design.gouv.fr/v1.14/storybook/img/placeholder.16x9.png"
            linkProps={{
              href: "#",
            }}
            size="medium"
            title="J’utilise un logiciel métier interconnecté"
            titleAs="h3"
            footer={<Button>Me renseigner</Button>}
          />
        </Stack>
      </InnerContainer>
    </OuterContainer>
  );
}
