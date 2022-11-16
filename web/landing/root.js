import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Header } from "../common/Header";
import { ManagerImage, SoftwareImage, WorkerImage } from "common/utils/icons";
import { useIsWidthDown } from "common/utils/useWidth";
import { MainCtaButton } from "../pwa/components/MainCtaButton";
import { Footer } from "./footer";
import {
  LandingSection,
  LandingSectionList,
  useSectionStyles
} from "./sections/LandingSection";
import { WebinarListSection } from "./sections/WebinarListSection";
import { VideoCard } from "./ResourcePage/VideoCard";
import { resourcePagesClasses } from "./ResourcePage/styles/ResourcePagesStyle";
import { IntroSection } from "./sections/IntroSection";

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
    flexBasis: "auto"
  },
  questionTitle: {
    paddingBottom: theme.spacing(1)
  }
}));

const videos = [
  {
    title: "Mobilic, qu'est-ce que c'est ?",
    videoKey: "resources/videos/accueil/accueil-qu-est-ce-que-mobilic.mp4",
    posterKey:
      "resources/videos/accueil/accueil-qu-est-ce-que-mobilic-preview.png"
  },
  {
    title: "Mobilic est-il conforme à la réglementation ?",
    videoKey: "resources/videos/accueil/accueil-reglementaire.mp4",
    posterKey: "resources/videos/accueil/accueil-reglementaire-preview.png"
  }
];

function Showcase({
  image,
  imageDescription,
  imageSubDescription,
  imagePosition,
  descriptionTitle,
  descriptionContent,
  ctaTarget,
  ctaLabel,
  width
}) {
  const classes = useStyles();

  const Image = props => (
    <Grid container direction="column" spacing={1} alignItems="center">
      <Grid item>{image}</Grid>
      <Grid item>
        <Typography className="bold" variant="h4" color="primary">
          {imageDescription}
        </Typography>
        <Typography className={classes.subDescription} variant="body2">
          {imageSubDescription}
        </Typography>
      </Grid>
    </Grid>
  );

  const Description = props => [
    <Typography align="left" variant="h4" key={0} className="bold">
      {descriptionTitle}
    </Typography>,
    <React.Fragment key={1}>{descriptionContent}</React.Fragment>,
    <MainCtaButton
      aria-label={ctaLabel}
      key={2}
      className={classes.cta}
      href={ctaTarget}
    >
      {ctaLabel}
    </MainCtaButton>
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
  const classes = useStyles();
  const sectionClasses = useSectionStyles();
  const resourceClasses = resourcePagesClasses();

  return [
    <Header key={1} />,
    <IntroSection key={2} />,
    <LandingSectionList key={3}>
      <LandingSection title="Mobilic ... 🤔 qu'est-ce que c'est ?">
        <Typography className={sectionClasses.sectionIntroText}>
          Mobilic est la plateforme gouvernementale qui permet de{" "}
          <strong>simplifier le suivi du temps de travail</strong> dans le
          transport routier léger et le déménagement afin de lutter contre le
          travail illégal.
        </Typography>
        <Typography className={sectionClasses.sectionIntroText}>
          Le livret individuel de contrôle (LIC), qui sert aujourd'hui à
          l'enregistrement du temps de travail des conducteurs de véhicules
          utilitaires légers de moins de 3,5 tonnes, et des autres personnels
          roulants non conducteurs, souffre de problèmes unanimement décriés
          (praticabilité pour les salarié(e)s, lourdeur administrative et de
          gestion, faible fiabilité pour le contrôle). Avec Mobilic{" "}
          <a
            href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043023481"
            target="_blank"
            rel="noopener noreferrer"
          >
            vous n'avez plus besoin du LIC papier
          </a>{" "}
          pour respecter vos engagements sociaux.
        </Typography>
        <Container
          className={`${resourceClasses.whiteSection}`}
          maxWidth={false}
        >
          <Container maxWidth="lg" className={resourceClasses.inner}>
            <Grid container direction="row" alignItems="center" spacing={1}>
              {videos.map(video => (
                <Grid key={video.videoKey} item xs={12} sm={6}>
                  <VideoCard
                    description={video.title}
                    videoKey={video.videoKey}
                    posterKey={video.posterKey}
                  />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Container>
      </LandingSection>
      {process.env.REACT_APP_FETCH_WEBINARS && <WebinarListSection />}
      <LandingSection title="A qui s'adresse Mobilic ?">
        <Typography className={sectionClasses.sectionIntroText}>
          Mobilic s'adresse aux conducteurs des entreprises de transport routier
          qui utilisent des véhicules utilitaires légers (VUL, {"<"} 3.5T), et
          aux autres{" "}
          <strong>
            personnels roulants qui sont soumis au livret individuel de contrôle
            (LIC)
          </strong>{" "}
          conformément aux articles R. 3312-19, 2° et R. 3312-58, 2° du code des
          transports : déménagement, messagerie, fret express, transport de
          personnes.
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
                    Enregistrer de manière simple et rapide mon temps de travail
                    et mes frais
                  </li>
                  <li>
                    Accéder à tout moment à mon relevé d'heures et de frais
                  </li>
                </ul>
              </div>
            }
            ctaLabel="M'inscrire comme travailleur mobile"
            ctaTarget="/signup/user"
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
                  Alléger la gestion administrative des données sociales de mon
                  entreprise en évitant la double saisie des informations
                </li>
                <li>
                  Optimiser l'organisation de mes équipes en accédant aux
                  données sociales en temps réel
                </li>
              </ul>
            }
            ctaLabel="M'inscrire comme gestionnaire"
            ctaTarget="/signup/admin"
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
                  Enrichir mon logiciel avec les données sociales, accessibles
                  sans délai
                </li>
                <li>
                  Garantir la conformité réglementaire de mes entreprises
                  clientes
                </li>
              </ul>
            }
            ctaLabel="Découvrir l'API"
            ctaTarget="https://developers.mobilic.beta.gouv.fr/"
          />
        </Box>
      </LandingSection>
      <LandingSection title="Ce qu'il faut savoir sur Mobilic">
        <Grid
          container
          spacing={4}
          alignItems="center"
          justifyContent="space-between"
          className={classes.showcase}
        >
          <Grid
            item
            md
            container
            direction="column"
            spacing={4}
            alignItems="flex-start"
            style={{ textAlign: "justify", flexGrow: 100 }}
          >
            <Grid item>
              <Typography variant="h5" className={classes.questionTitle}>
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
              <Typography variant="h5" className={classes.questionTitle}>
                Dois-je doublonner avec le LIC papier quand j’utilise Mobilic ?
              </Typography>
              <Typography>
                Non ! Mobilic permet de justifier du respect des exigences
                fixées dans les articles R. 3312-19 et R. 3312-58 du code des
                transports. Par ailleurs, dans le secteur du déménagement, un{" "}
                <a
                  href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043023481"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  arrêté spécifique
                </a>{" "}
                permet de justifier du respect du relevé hebdomadaire d’activité
                au moyen de Mobilic par dérogation à la présentation sous forme
                d’un carnet auto-carboné.{" "}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs className={classes.faqCta}>
            <MainCtaButton
              aria-label="Foire aux questions"
              href="https://faq.mobilic.beta.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consulter la foire aux questions
            </MainCtaButton>
          </Grid>
        </Grid>
      </LandingSection>
    </LandingSectionList>,
    <Footer key={4} />
  ];
};
