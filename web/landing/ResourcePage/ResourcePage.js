import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
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
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Main } from "../../common/semantics/Main";

export const RESOURCES_DOCUMENT = {
  noticeUtilisation: {
    gestionnaire: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/5qE1tW5HS38tDT",
      download:
        "https://drive.google.com/uc?export=download&id=1tIDN9OaqC6c23-TvLcM4aH_IZvIyPjCp"
    },
    salarie: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/oLCKAvydrLM3XI",
      download:
        "https://drive.google.com/uc?export=download&id=130GKccHEdlh-9Wll_mCxUutO0_3_bsH2"
    },
    controleur: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/khEsCS5bTemUi7",
      download:
        "https://drive.google.com/uc?export=download&id=19XKk9wp6N0O7MVL_xcx6NudeSnKRBeGC"
    },
    controleurConnected: {
      slideshare:
        "https://www.slideshare.net/slideshow/embed_code/key/9HTSwAGETtOIZP",
      download:
        "https://drive.google.com/uc?export=download&id=1EJj3FmvUkjiqRoESioBFZDQNlFVWKWp4"
    }
  },
  brochure: {
    slideshare:
      "https://www.slideshare.net/slideshow/embed_code/key/cK7t047QZRs3QH",
    download:
      "https://drive.google.com/uc?id=1tdO2GjJqai5sFjc22rVQdrut03evepa5&export=download"
  }
};

export function ResourcePage() {
  usePageTitle("Documentation - Mobilic");
  const classes = resourcePagesClasses();

  return (
    <>
      <Header />
      <Main maxWidth={false} sx={{ marginBottom: 4 }}>
        <Container
          className={`${classes.container} ${classes.whiteSection}`}
          maxWidth={false}
        >
          <Container maxWidth="xl" className={classes.inner}>
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
              priority="secondary"
              size="small"
              className={classes.viewAllButton}
              linkProps={{
                href: "https://faq.mobilic.beta.gouv.fr/",
                target: "_blank"
              }}
            >
              Accéder à la FAQ
            </Button>
          </Container>
        </Container>
        <Container
          className={`${classes.container} ${classes.whiteSection}`}
          maxWidth={false}
        >
          <Container maxWidth="xl" className={classes.inner}>
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
        </Container>
        <Container
          className={`${classes.container} ${classes.whiteSection}`}
          maxWidth={false}
        >
          <Container maxWidth="xl" className={classes.inner}>
            <Typography
              variant={"h3"}
              component="h2"
              className={classes.resourceSubtitle}
            >
              Je cherche des informations sur la réglementation en vigueur dans
              le transport léger
            </Typography>
            <Grid container direction="row" alignItems="stretch" spacing={10}>
              {Object.values(REGULATION_RULES)
                .slice(0, 3)
                .map((rule, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <RegulationCard
                      rule={rule}
                      titleProps={{ component: "h3" }}
                    />
                  </Grid>
                ))}
            </Grid>
            <LinkButton
              size="small"
              className={classes.viewAllButton}
              to="/resources/regulations"
            >
              Voir tous les seuils réglementaires
            </LinkButton>
          </Container>
        </Container>
      </Main>
      <Footer />
    </>
  );
}
