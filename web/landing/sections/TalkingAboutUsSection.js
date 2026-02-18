import React from "react";
import Typography from "@mui/material/Typography";
import "react-multi-carousel/lib/styles.css";
import {
  ActuTransportLogistiqueImage,
  AlexisDemenagementImage,
  AxecImage,
  BretagneMaceDemenagementImage,
  EcoLogisticsImage,
  FlottesAutomobilesImage,
  HubInstituteImage,
  RadioSupplyChainImage,
  SupplyChainVillageImage,
  VirImage,
} from "common/utils/icons";
import Carousel from "react-multi-carousel";
import { PressCard } from "../ResourcePage/PressCard";
import { TestimonialCard } from "../ResourcePage/TestimonialCard";
import { VideoCard, VIDEOS } from "../ResourcePage/VideoCard";
import { resourceCardsClasses } from "../ResourcePage/styles/ResourceCardsStyle";
import { OuterContainer } from "../components/OuterContainer";
import { InnerContainer } from "../components/InnerContainer";
import { Stack } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  subTitle: {
    fontSize: "1.375rem",
    color: fr.colors.decisions.background.flat.blueFrance.default,
    fontWeight: "bold",
  },
}));

export function TalkingAboutUsSection({ grayBackground }) {
  const responsivePressArticles = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 500 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 500, min: 0 },
      items: 1,
    },
  };
  const responsiveTestimonials = {
    desktop: {
      breakpoint: { max: 3000, min: 800 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 800, min: 500 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 500, min: 0 },
      items: 1,
    },
  };
  const PRESS_ARTICLES = [
    {
      imageComponent: ActuTransportLogistiqueImage,
      link: "https://www.actu-transport-logistique.fr/officiel-des-transporteurs/actualites/transport-leger-mobilic-poursuit-son-implantation-dans-les-entreprises-705685.php",
      matomoTag: "actu-transport-1",
    },
    {
      imageComponent: HubInstituteImage,
      link: "https://hubinstitute.com/Videos/stage-2-mobilic-rendre-clairs-et-accessibles-les-droits-des-chauffeurs-routiers",
      buttonLabel: "Voir la vidéo",
      matomoTag: "hub-institute",
    },
    {
      imageComponent: EcoLogisticsImage,
      link: "https://fr.calameo.com/read/003039428318ecae421a5?authid=tXJH7bvui2rW&page=6",
      matomoTag: "eco-logistics",
    },
    {
      imageComponent: SupplyChainVillageImage,
      link: "https://supplychain-village.com/interview-flash/evenements/interview-de-marie-vacherot-et-patrick-lambret/",
      buttonLabel: "Voir la vidéo",
      matomoTag: "supply-chain-village",
    },
    {
      imageComponent: FlottesAutomobilesImage,
      link: "https://www.flotauto.com/transport-leger-demenagement-lic-mobilic-20210930.html",
      matomoTag: "flottes-automobiles",
    },
    {
      imageComponent: RadioSupplyChainImage,
      link: "https://www.radiosupplychain.fr/podcasts/reportage-mobilic/",
      buttonLabel: "Ecouter l'entretien",
      matomoTag: "radio-supply-chain",
    },
    {
      imageComponent: AxecImage,
      link: "https://www.linkedin.com/pulse/mobilic-ou-la-fin-du-petit-menteur-marc-bougaut/?trackingId=mDlGzBwMsikJJNPh2GI1yg%3D%3D",
      matomoTag: "axec-image",
    },
    {
      imageComponent: ActuTransportLogistiqueImage,
      link: "https://www.actu-transport-logistique.fr/routier/une-application-web-pour-lutter-contre-le-travail-illegal-dans-le-transport-leger-674545.php",
      matomoTag: "actu-transport-2",
    },
  ];

  const TESTIMONIALS_TEXT = [
    {
      imageComponent: AlexisDemenagementImage,
      sentence:
        "« Les temps de travail sont plus fiables. J'ai un meilleur recul sur les heures quotidiennes, ce qui me permet de mieux gérer le repos de mes salariés. »",
      author: "Ludovic Almy",
      position: "Responsable exploitation chez Alexis +",
    },
    {
      imageComponent: VirImage,
      sentence: (
        <span>
          « Nous n'utilisons plus que Mobilic pour le suivi du temps de travail.
          Nos collaborateurs l'ont adopté sans difficulté. »<br />
          <br />
        </span>
      ),
      author: "Raphaël Grenom",
      position: "Directeur de l'agence VIR Dijon",
    },
    {
      imageComponent: BretagneMaceDemenagementImage,
      sentence: (
        <span>
          « C'est un gain de temps considérable. Les salariés sont autonomes et
          le suivi du côté de l'exploitant est facile. »<br />
          <br />
        </span>
      ),
      author: "Yoann Macé",
      position: "Gérant chez Bretagne Macé déménagement",
    },
  ];

  const TESTIMONIALS_VIDEOS = [
    {
      video: VIDEOS.Testimony_Almy,
    },
    {
      video: VIDEOS.Testimony_Grenom,
    },
    {
      video: VIDEOS.Testimony_Mace,
    },
    {
      video: VIDEOS.Testimony_Cohen,
    },
    {
      video: VIDEOS.Testimony_Kbidi,
    },
  ];

  const classes = useStyles();
  const cardClasses = resourceCardsClasses();

  return (
    <OuterContainer grayBackground={grayBackground}>
      <InnerContainer>
        <Stack direction="column" rowGap={4}>
          <Typography variant={"h3"} component="h2">
            Ils parlent de Mobilic
          </Typography>
          <Stack direction="column" rowGap={3}>
            <Typography component="h3" className={classes.subTitle}>
              Nos utilisateurs
            </Typography>
            <Carousel responsive={responsiveTestimonials}>
              {TESTIMONIALS_TEXT.map(
                ({ author, position, imageComponent, sentence }) => (
                  <TestimonialCard
                    key={author}
                    ImageComponent={imageComponent}
                    sentence={sentence}
                    author={author}
                    position={position}
                  />
                ),
              )}
            </Carousel>

            <Carousel responsive={responsivePressArticles}>
              {TESTIMONIALS_VIDEOS.map(({ video }) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  className={cardClasses.pressCard}
                  titleProps={{ component: "h4" }}
                  aspectRatio="1/1"
                />
              ))}
            </Carousel>
          </Stack>
          <Stack direction="column" rowGap={3}>
            <Typography component="h3" className={classes.subTitle}>
              La presse
            </Typography>
            <Carousel responsive={responsivePressArticles}>
              {PRESS_ARTICLES.map((article) => (
                <PressCard
                  key={article.link}
                  ImageComponent={article.imageComponent}
                  articleLink={article.link}
                  buttonLabel={article.buttonLabel}
                  matomoTag={article.matomoTag}
                />
              ))}
            </Carousel>
          </Stack>
        </Stack>
      </InnerContainer>
    </OuterContainer>
  );
}
