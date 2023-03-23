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
      imageComponent: HubInstituteImage,
      link:
        "https://hubinstitute.com/Videos/stage-2-mobilic-rendre-clairs-et-accessibles-les-droits-des-chauffeurs-routiers"
    },
    {
      imageComponent: EcoLogisticsImage,
      link:
        "https://fr.calameo.com/read/003039428318ecae421a5?authid=tXJH7bvui2rW"
    },
    {
      imageComponent: SupplyChainVillageImage,
      link:
        "https://supplychain-village.com/interview-flash/evenements/interview-de-marie-vacherot-et-patrick-lambret/"
    },
    {
      imageComponent: FlottesAutomobilesImage,
      link:
        "https://www.flotauto.com/transport-leger-demenagement-lic-mobilic-20210930.html"
    },
    {
      imageComponent: RadioSupplyChainImage,
      link: "https://www.radiosupplychain.fr/podcasts/reportage-mobilic/"
    },
    {
      imageComponent: AxecImage,
      link:
        "https://www.linkedin.com/pulse/mobilic-ou-la-fin-du-petit-menteur-marc-bougaut/?trackingId=mDlGzBwMsikJJNPh2GI1yg%3D%3D"
    },
    {
      imageComponent: ActuTransportLogistiqueImage,
      link:
        "https://www.actu-transport-logistique.fr/routier/une-application-web-pour-lutter-contre-le-travail-illegal-dans-le-transport-leger-674545.php"
    }
  ];

  const TESTMINONIALS = [
    {
      imageComponent: AlexisDemenagementImage,
      sentence:
        "«Les temps de travail sont plus fiables. J'ai un meilleur recul sur les heures quotidiennes, ce qui me permet de mieux gérer le repos de mes salariés.»",
      author: "Ludovic Almy, responsable exploitation chez Alexis +"
    },
    {
      imageComponent: VirImage,
      sentence:
        "«Nous n'utilisons plus que Mobilic pour le suivi du temps de travail. Nos collaborateurs l'ont adopté sans difficulté.»",
      author: "Raphaël Grenom, directeur de l'agence VIR Dijon"
    },
    {
      imageComponent: BretagneMaceDemenagementImage,
      sentence:
        "«C'est un gain de temps considérable. Les salariés sont autonomes et le suivi du côté de l'exploitant est facile.»",
      author: "Yoann Macé, gérant chez Bretagne Macé déménagement"
    }
  ];

  const classes = useSectionStyles();

  return (
    <LandingSection title="Ils parlent de Mobilic">
      <Typography variant={"h3"} className={classes.sectionSubtitle}>
        Nos utilisateurs
      </Typography>
      <Carousel responsive={responsiveTestimonials}>
        {TESTMINONIALS.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            ImageComponent={testimonial.imageComponent}
            sentence={testimonial.sentence}
            author={testimonial.author}
          />
        ))}
      </Carousel>

      <Typography variant={"h3"} className={classes.sectionSubtitle}>
        La presse
      </Typography>
      <Carousel responsive={responsivePressArticles}>
        {PRESS_ARTICLES.map((article, index) => (
          <PressCard
            key={index}
            ImageComponent={article.imageComponent}
            articleLink={article.link}
          />
        ))}
      </Carousel>
    </LandingSection>
  );
}
