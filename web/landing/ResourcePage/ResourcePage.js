import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import Button from "@mui/material/Button";
import { FaqCard } from "./FaqCard";
import {
  ControllerImage,
  ManagerImage,
  WorkerImage,
  SoftwareImage
} from "common/utils/icons";
import { IconCard } from "./IconCard";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { LinkButton } from "../../common/LinkButton";
import { RegulationCard } from "./RegulationCard";
import { REGULATION_RULES } from "./RegulationRules";

export const RESOURCES_DOCUMENT = {
  noticeUtilisation: {
    gestionnaire: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/4ionudhjzhSaBV/",
      download:
        "https://drive.google.com/uc?id=133TOYQrMlXWf9_7owZqXqKZcFfDwpuRY&export=download"
    },
    salarie: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/1kEIdSBN2HJMdN/",
      download:
        "https://drive.google.com/uc?id=1uXGIUnxTfTOCKhbU5xQ9Eunr0U3RhaKT&export=download"
    },
    controleur: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/AqIR3swVmNhjA5/",
      download:
        "https://drive.google.com/uc?id=16P4hPMFa6zExka_tGt4Nf3yYBGabTbPk&export=download"
    },
    controleurConnected: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/1etQtN83YjOl2i/",
      download:
        "https://drive.google.com/uc?id=106EYhCMiZfinrhROorxsCle9gTE6plKi&export=download"
    }
  },
  brochure: {
    slideshare:
      "https://www.slideshare.net/slideshow/embed_code/key/8hjPh7eM8CXire/",
    download:
      "https://drive.google.com/uc?id=1u9RbbyMNEVEMuBZUP0CjjnN4QBqn4Esj&export=download"
  }
};

export function ResourcePage() {
  const classes = resourcePagesClasses();

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <PaperContainerTitle variant="h1" className={classes.title}>
          Bienvenue sur la page documentation
        </PaperContainerTitle>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je découvre Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Qu'est ce que Mobilic ?"
              answer="Mobilic est un outil numérique de saisie et de suivi du temps de travail."
              link="https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Qui est concerné par Mobilic ?"
              answer="Toutes les entreprises de transport léger et de déménagement."
              link="https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              question="Est-il possible de remplacer le livret individuel de contrôle par Mobilic ?"
              answer="Oui, si vous utilisez Mobilic, vous n'avez pas besoin de continuer à remplir le LIC."
              link="https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/securite-et-confidentialite-des-donnees"
            />
          </Grid>
        </Grid>
        <Button
          color="primary"
          size="small"
          className={classes.viewAllButton}
          variant={"outlined"}
          href="https://faq.mobilic.beta.gouv.fr/"
          target="_blank"
        >
          Accéder à la FAQ
        </Button>
      </Container>
    </Container>,
    <Container
      key={3}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je cherche de la documentation pour m'aider à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={3}>
            <IconCard
              link="/resources/admin"
              description="Documentation gestionnaire"
              IconComponent={ManagerImage}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <IconCard
              link="/resources/driver"
              description="Documentation travailleur mobile"
              IconComponent={WorkerImage}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <IconCard
              link="/resources/controller"
              description="Documentation contrôleur"
              IconComponent={ControllerImage}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <IconCard
              href="https://developers.mobilic.beta.gouv.fr"
              description="Documentation API"
              IconComponent={SoftwareImage}
            />
          </Grid>
        </Grid>
      </Container>
    </Container>,
    <Container
      key={4}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Typography variant={"h3"} className={classes.resourceSubtitle}>
          Je cherche des informations sur la réglementation en vigueur dans le
          transport léger
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          {Object.values(REGULATION_RULES)
            .slice(0, 3)
            .map((rule, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <RegulationCard rule={rule} />
              </Grid>
            ))}
        </Grid>
        <LinkButton
          color="primary"
          size="small"
          className={classes.viewAllButton}
          variant={"outlined"}
          to="/resources/regulations"
        >
          Voir tous les seuils réglementaires
        </LinkButton>
      </Container>
    </Container>,
    <Footer key={5} />
  ];
}
