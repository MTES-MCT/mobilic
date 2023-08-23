import React from "react";
import { LandingSection, useSectionStyles } from "./LandingSection";
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
  VirImage
} from "common/utils/icons";
import Carousel from "react-multi-carousel";
import { PressCard } from "../ResourcePage/PressCard";
import { TestimonialCard } from "../ResourcePage/TestimonialCard";
import { VideoCard } from "../ResourcePage/VideoCard";
import { resourceCardsClasses } from "../ResourcePage/styles/ResourceCardsStyle";

import TestimonialJCBVideo from "common/assets/videos/testimonials/jeremy_cohen_boulakia.mp4";
import TestimonialJCBPoster from "common/assets/videos/testimonials/jeremy_cohen_boulakia.jpg";
import TestimonialLAVideo from "common/assets/videos/testimonials/ludovic_almy.mp4";
import TestimonialLAPoster from "common/assets/videos/testimonials/ludovic_almy.jpg";
import TestimonialNKVideo from "common/assets/videos/testimonials/nicolas_kbidi.mp4";
import TestimonialNKPoster from "common/assets/videos/testimonials/nicolas_kbidi.jpg";
import TestimonialRGVideo from "common/assets/videos/testimonials/raphael_grenom.mp4";
import TestimonialRGPoster from "common/assets/videos/testimonials/raphael_grenom.jpg";
import TestimonialYMVideo from "common/assets/videos/testimonials/yoann_mace.mp4";
import TestimonialYMPoster from "common/assets/videos/testimonials/yoann_mace.jpg";

export function TalkingAboutUsSection() {
  const responsivePressArticles = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 500 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 500, min: 0 },
      items: 1
    }
  };
  const responsiveTestimonials = {
    desktop: {
      breakpoint: { max: 3000, min: 800 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 800, min: 500 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 500, min: 0 },
      items: 1
    }
  };
  const PRESS_ARTICLES = [
    {
      imageComponent: ActuTransportLogistiqueImage,
      link:
        "https://www.actu-transport-logistique.fr/officiel-des-transporteurs/actualites/transport-leger-mobilic-poursuit-son-implantation-dans-les-entreprises-705685.php",
      matomoTag: "actu-transport-1"
    },
    {
      imageComponent: HubInstituteImage,
      link:
        "https://hubinstitute.com/Videos/stage-2-mobilic-rendre-clairs-et-accessibles-les-droits-des-chauffeurs-routiers",
      buttonLabel: "Voir la vidéo",
      matomoTag: "hub-institute"
    },
    {
      imageComponent: EcoLogisticsImage,
      link:
        "https://fr.calameo.com/read/003039428318ecae421a5?authid=tXJH7bvui2rW&page=6",
      matomoTag: "eco-logistics"
    },
    {
      imageComponent: SupplyChainVillageImage,
      link:
        "https://supplychain-village.com/interview-flash/evenements/interview-de-marie-vacherot-et-patrick-lambret/",
      buttonLabel: "Voir la vidéo",
      matomoTag: "supply-chain-village"
    },
    {
      imageComponent: FlottesAutomobilesImage,
      link:
        "https://www.flotauto.com/transport-leger-demenagement-lic-mobilic-20210930.html",
      matomoTag: "flottes-automobiles"
    },
    {
      imageComponent: RadioSupplyChainImage,
      link: "https://www.radiosupplychain.fr/podcasts/reportage-mobilic/",
      buttonLabel: "Ecouter l'entretien",
      matomoTag: "radio-supply-chain"
    },
    {
      imageComponent: AxecImage,
      link:
        "https://www.linkedin.com/pulse/mobilic-ou-la-fin-du-petit-menteur-marc-bougaut/?trackingId=mDlGzBwMsikJJNPh2GI1yg%3D%3D",
      matomoTag: "axec-image"
    },
    {
      imageComponent: ActuTransportLogistiqueImage,
      link:
        "https://www.actu-transport-logistique.fr/routier/une-application-web-pour-lutter-contre-le-travail-illegal-dans-le-transport-leger-674545.php",
      matomoTag: "actu-transport-2"
    }
  ];

  const TESTIMONIALS_TEXT = [
    {
      imageComponent: AlexisDemenagementImage,
      sentence:
        "« Les temps de travail sont plus fiables. J'ai un meilleur recul sur les heures quotidiennes, ce qui me permet de mieux gérer le repos de mes salariés. »",
      author: "Ludovic Almy, responsable exploitation chez Alexis +"
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
      author: "Raphaël Grenom, directeur de l'agence VIR Dijon"
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
      author: "Yoann Macé, gérant chez Bretagne Macé déménagement"
    }
  ];

  const TESTIMONIALS_VIDEOS = [
    {
      title: "Ludovic Almy, responsable d'exploitation dans le déménagement",
      video: TestimonialLAVideo,
      poster: TestimonialLAPoster,
      matomoTag: "almy"
    },
    {
      title:
        "Raphaël Grenom, directeur d'une agence de livraison de marchandises",
      video: TestimonialRGVideo,
      poster: TestimonialRGPoster,
      matomoTag: "grenom"
    },
    {
      title: (
        <span>
          Yoann Macé,
          <br />
          gérant d'une entreprise de déménagement
        </span>
      ),
      video: TestimonialYMVideo,
      poster: TestimonialYMPoster,
      matomoTag: "mace"
    },
    {
      title:
        "Jérémy Cohen Boulakia, directeur d'une entreprise de livraison de marchandises",
      video: TestimonialJCBVideo,
      poster: TestimonialJCBPoster,
      matomoTag: "boulakia"
    },
    {
      title: (
        <span>
          Nicolas K'bidi,
          <br />
          déménageur
          <br />
          <br />
        </span>
      ),
      video: TestimonialNKVideo,
      poster: TestimonialNKPoster,
      matomoTag: "k-bidi"
    }
  ];

  const classes = useSectionStyles();
  const cardClasses = resourceCardsClasses();

  return (
    <LandingSection title="Ils parlent de Mobilic" id="temoignages">
      <Typography variant={"h3"} className={classes.sectionSubtitle}>
        Nos utilisateurs
      </Typography>
      <Carousel responsive={responsiveTestimonials}>
        {TESTIMONIALS_TEXT.map(testimonial => (
          <TestimonialCard
            key={testimonial.author}
            ImageComponent={testimonial.imageComponent}
            sentence={testimonial.sentence}
            author={testimonial.author}
          />
        ))}
      </Carousel>

      <Carousel
        responsive={responsivePressArticles}
        className={classes.pressArticles}
      >
        {TESTIMONIALS_VIDEOS.map(video => (
          <VideoCard
            key={video.matomoTag}
            video={video.video}
            description={video.title}
            poster={video.poster}
            className={cardClasses.pressCard}
            matomoTag={video.matomoTag}
          />
        ))}
      </Carousel>

      <Typography variant={"h3"} className={classes.pressSubsection}>
        La presse
      </Typography>
      <Carousel responsive={responsivePressArticles}>
        {PRESS_ARTICLES.map(article => (
          <PressCard
            key={article.link}
            ImageComponent={article.imageComponent}
            articleLink={article.link}
            buttonLabel={article.buttonLabel}
            matomoTag={article.matomoTag}
          />
        ))}
      </Carousel>
    </LandingSection>
  );
}
