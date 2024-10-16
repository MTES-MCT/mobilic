import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Header } from "../common/Header";
import { ManagerImage, SoftwareImage, WorkerImage } from "common/utils/icons";
import { useIsWidthDown } from "common/utils/useWidth";
import { Footer } from "./footer";
import {
  LandingSection,
  LandingSectionList,
  useSectionStyles
} from "./sections/LandingSection";
import { WebinarListSection } from "./sections/WebinarListSection";
import { IntroSection } from "./sections/IntroSection";
import { TalkingAboutUsSection } from "./sections/TalkingAboutUsSection";
import { usePageTitle } from "../common/UsePageTitle";
import { LoadingButton } from "common/components/LoadingButton";

const useStyles = makeStyles(theme => ({
  videoContainer: {
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden"
  },
  showcase: {
    padding: theme.spacing(2)
  },
  lightBlue: {
    backgroundColor: "#b4e1fa"
  },
  subDescription: {
    fontStyle: "italic"
  },
  cta: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  faqCta: {
    flexShrink: 0,
    flexBasis: "auto",
    margin: "auto"
  },
  questionTitle: {
    paddingBottom: theme.spacing(1)
  }
}));

function Showcase({
  image,
  imageDescription,
  imageSubDescription,
  imagePosition,
  descriptionTitle,
  descriptionContent,
  ctaTarget,
  ctaLabel,
  titleProps = {},
  width
}) {
  const classes = useStyles();

  const Image = props => (
    <Grid container direction="column" spacing={1} alignItems="center">
      <Grid item>{image}</Grid>
      <Grid item>
        <Typography
          className="bold"
          variant="h4"
          color="primary"
          {...titleProps}
        >
          {imageDescription}
        </Typography>
        <Typography className={classes.subDescription} variant="body2">
          {imageSubDescription}
        </Typography>
      </Grid>
    </Grid>
  );

  const Description = props => [
    <Typography
      align="left"
      variant="h4"
      key={0}
      className="bold"
      component="span"
    >
      {descriptionTitle}
    </Typography>,
    <React.Fragment key={1}>{descriptionContent}</React.Fragment>,
    <LoadingButton key={2} className={classes.cta} href={ctaTarget}>
      {ctaLabel}
    </LoadingButton>
  ];

  const isMdDown = useIsWidthDown("md");
  const leftAlignImage = isMdDown || imagePosition === "left";

  return (
    <Grid
      container
      alignItems="center"
      direction="row"
      spacing={4}
      justifyContent="space-between"
    >
      <Grid
        item
        xs={leftAlignImage ? true : null}
        sm={leftAlignImage ? null : true}
      >
        {leftAlignImage ? <Image /> : <Description />}
      </Grid>
      <Grid
        item
        sm={leftAlignImage ? true : null}
        xs={leftAlignImage ? null : true}
      >
        {leftAlignImage ? <Description /> : <Image />}
      </Grid>
    </Grid>
  );
}

export const Landing = () => {
  usePageTitle("Accueil - Mobilic");
  const classes = useStyles();
  const sectionClasses = useSectionStyles();

  return (
    <>
      <Header />
      <IntroSection />
      <Box textAlign="center">
        <LandingSectionList>
          {process.env.REACT_APP_FETCH_WEBINARS && <WebinarListSection />}
          <LandingSection
            title="A qui s'adresse Mobilic ?"
            titleProps={{ component: "h2" }}
          >
            <Typography className={sectionClasses.sectionIntroText}>
              Mobilic s'adresse aux conducteurs des entreprises de transport
              routier qui utilisent des véhicules utilitaires légers (VUL, {"<"}{" "}
              3.5T), et aux autres{" "}
              <strong>
                personnels roulants qui sont soumis au livret individuel de
                contrôle (LIC)
              </strong>{" "}
              conformément aux articles R. 3312-19, 2° et R. 3312-58, 2° du code
              des transports : déménagement, messagerie, fret express, transport
              de personnes.
            </Typography>
            <Box className={`${classes.lightBlue}`} p={2}>
              <Showcase
                image={<WorkerImage height={200} width={200} />}
                imagePosition="left"
                imageDescription="Travailleur mobile"
                imageSubDescription="Conducteurs et autres personnels roulants"
                descriptionTitle="Suivre simplement mon temps de travail et être mieux informé(e) sur mes droits"
                descriptionContent={
                  <div
                    style={{
                      textAlign: "left",
                      fontSize: "1rem",
                      lineHeight: "1.6"
                    }}
                  >
                    <p>Directement depuis mon téléphone</p>
                    <ul
                      style={{
                        textAlign: "justify",
                        fontSize: "1rem",
                        lineHeight: "1.6"
                      }}
                    >
                      <li>
                        Enregistrer de manière simple et rapide mon temps de
                        travail et mes frais
                      </li>
                      <li>
                        Accéder à tout moment à mon relevé d'heures et de frais
                      </li>
                    </ul>
                  </div>
                }
                ctaLabel="M'inscrire comme travailleur mobile"
                ctaTarget="/signup/user"
                titleProps={{ component: "h3" }}
              />
            </Box>
            <Box p={2}>
              <Showcase
                image={<ManagerImage height={200} width={200} />}
                imagePosition="right"
                imageDescription="Gestionnaire"
                imageSubDescription="Responsables d'exploitation, dirigeant(e)s"
                descriptionTitle="Gérer facilement le temps de travail des salarié(e)s de mon entreprise"
                descriptionContent={
                  <ul
                    style={{
                      textAlign: "justify",
                      fontSize: "1rem",
                      lineHeight: "1.6"
                    }}
                  >
                    <li>
                      Alléger la gestion administrative des données sociales de
                      mon entreprise en évitant la double saisie des
                      informations
                    </li>
                    <li>
                      Optimiser l'organisation de mes équipes en accédant aux
                      données sociales en temps réel
                    </li>
                  </ul>
                }
                ctaLabel="M'inscrire comme gestionnaire"
                ctaTarget="/signup/admin"
                titleProps={{ component: "h3" }}
              />
            </Box>
            <Box className={classes.lightBlue} p={2}>
              <Showcase
                image={<SoftwareImage height={200} width={200} />}
                imagePosition="left"
                imageDescription="Logiciel métier"
                descriptionTitle="Echanger en temps réel avec l'API Mobilic des données sociales clés pour la gestion du personnel"
                descriptionContent={
                  <ul
                    style={{
                      textAlign: "justify",
                      fontSize: "1rem",
                      lineHeight: "1.6"
                    }}
                  >
                    <li>
                      Enrichir mon logiciel avec les données sociales,
                      accessibles sans délai
                    </li>
                    <li>
                      Garantir la conformité réglementaire de mes entreprises
                      clientes
                    </li>
                  </ul>
                }
                ctaLabel="Découvrir l'API"
                ctaTarget="https://developers.mobilic.beta.gouv.fr/"
                titleProps={{ component: "h3" }}
              />
            </Box>
          </LandingSection>
          <LandingSection
            title="Ce qu'il faut savoir sur Mobilic"
            titleProps={{ component: "h2" }}
          >
            <Grid
              container
              spacing={4}
              alignItems="center"
              justifyContent="space-between"
              className={classes.showcase}
            >
              <Grid
                item
                xs={12}
                container
                direction="column"
                spacing={4}
                alignItems="flex-start"
                style={{ textAlign: "justify", flexGrow: 100 }}
              >
                <Grid item>
                  <Typography
                    variant="h5"
                    component="h3"
                    className={classes.questionTitle}
                  >
                    Mobilic est-ce que ça fonctionne déjà ?
                  </Typography>
                  <Typography>
                    Oui bien sûr ! Vous pouvez déjà utiliser Mobilic pour
                    enregistrer le temps de travail. Le nom de domaine en
                    “beta.gouv.fr” indique que Mobilic fait partie des startups
                    d'État, des startups publiques développées au sein des
                    Ministères publics.
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="h5"
                    component="h3"
                    className={classes.questionTitle}
                  >
                    Dois-je doublonner avec le LIC papier quand j’utilise
                    Mobilic ?
                  </Typography>
                  <Typography>
                    Non ! Mobilic permet de justifier du respect des exigences
                    fixées dans les articles R. 3312-19 et R. 3312-58 du code
                    des transports. Par ailleurs, dans le secteur du
                    déménagement, un{" "}
                    <a
                      href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043023481"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      arrêté spécifique
                    </a>{" "}
                    permet de justifier du respect du relevé hebdomadaire
                    d’activité au moyen de Mobilic par dérogation à la
                    présentation sous forme d’un carnet auto-carboné.{" "}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12} className={classes.faqCta}>
                <LoadingButton
                  href="https://faq.mobilic.beta.gouv.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consulter la foire aux questions
                </LoadingButton>
              </Grid>
            </Grid>
          </LandingSection>
          <TalkingAboutUsSection />
        </LandingSectionList>
      </Box>
      <Footer />
    </>
  );
};
