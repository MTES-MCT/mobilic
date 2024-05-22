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
import { usePageTitle } from "../../common/UsePageTitle";

export const RESOURCES_DOCUMENT = {
  noticeUtilisation: {
    gestionnaire: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/csRjiZP7BrQcMu/",
      download:
        "https://drive.google.com/uc?export=download&id=1DBDA9057er3p6FRC7iQIuhZTZe8ldBux"
    },
    salarie: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/zIMzBV9OangCxm/",
      download:
        "https://drive.google.com/uc?export=download&id=1Ce9zM7B03TADWMWa4Gr5gmTsiMx4dm0m"
    },
    controleur: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/khEsCS5bTemUi7",
      download:
        "https://drive.google.com/uc?export=download&id=1XovEkL679iXg97uePoDACOdu1QYatt7J"
    },
    controleurConnected: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/r1TfId1XpMD66Z",
      download:
        "https://drive.google.com/uc?export=download&id=1kUdMyTkO7x-vPWLTOGwUcDXfuSeXAKi1"
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
  usePageTitle("Documentation - Mobilic");
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
        <Typography
          variant={"h3"}
          component="h2"
          className={classes.resourceSubtitle}
        >
          Je découvre Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={4}>
            <FaqCard
              titleProps={{ component: "h3" }}
              question="Qu'est ce que Mobilic ?"
              answer="Mobilic est un outil numérique de saisie et de suivi du temps de travail."
              link="https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              titleProps={{ component: "h3" }}
              question="Qui est concerné par Mobilic ?"
              answer="Toutes les entreprises de transport léger et de déménagement."
              link="https://faq.mobilic.beta.gouv.fr/comprendre-ce-quest-mobilic/vos-questions-recurrentes"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FaqCard
              titleProps={{ component: "h3" }}
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
        <Typography
          variant={"h3"}
          component="h2"
          className={classes.resourceSubtitle}
        >
          Je cherche de la documentation pour m'aider à utiliser Mobilic
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          <Grid item xs={12} sm={3}>
            <IconCard
              link="/resources/admin"
              description="Documentation gestionnaire"
              IconComponent={ManagerImage}
              titleProps={{ component: "h3" }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <IconCard
              link="/resources/driver"
              description="Documentation travailleur mobile"
              IconComponent={WorkerImage}
              titleProps={{ component: "h3" }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <IconCard
              link="/resources/controller"
              description="Documentation contrôleur"
              IconComponent={ControllerImage}
              titleProps={{ component: "h3" }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <IconCard
              href="https://developers.mobilic.beta.gouv.fr"
              description="Documentation API"
              IconComponent={SoftwareImage}
              titleProps={{ component: "h3" }}
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
        <Typography
          variant={"h3"}
          component="h2"
          className={classes.resourceSubtitle}
        >
          Je cherche des informations sur la réglementation en vigueur dans le
          transport léger
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={10}>
          {Object.values(REGULATION_RULES)
            .slice(0, 3)
            .map((rule, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <RegulationCard rule={rule} titleProps={{ component: "h3" }} />
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
