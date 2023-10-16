import React from "react";
import Typography from "@mui/material/Typography";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";

export const VIDEOS = {
  Home_Mobilic: {
    id: "873641091",
    title: "accueil-qu-est-ce-que-mobilic",
    description: "Mobilic, qu'est-ce que c'est ?"
  },
  Home_Regulation: {
    id: "873641124",
    title: "accueil-reglementaire",
    description: "Mobilic est-il conforme à la réglementation ?"
  },
  Admin_Inscription: {
    id: "873641619",
    title: "gestionnaire-inscription",
    description: "Vous inscrire sur Mobilic"
  },
  Admin_Utilisation: {
    id: "873641999",
    title: "gestionnaire-utilisation",
    description: "Utiliser l'interface gestionnaire"
  },
  Employee_Inscription: {
    id: "873641403",
    title: "salarie-inscription",
    description: "Inscription sur Mobilic"
  },
  Employee_Installation_Android: {
    id: "873641430",
    title: "salarie-installation-appli-android",
    description: "Télécharger Mobilic sur Android"
  },
  Employee_Installation_Iphone: {
    id: "873641464",
    title: "salarie-installation-appli-iphone",
    description: "Télécharger Mobilic sur iPhone"
  },
  Employee_Usage: {
    id: "873641485",
    title: "salarie-usage-quotidien",
    description: "Utiliser Mobilic au quotidien"
  },
  Tuto_Ctt: {
    id: "873642195",
    title: "tuto-ctt-it-juin-2023",
    description: "Effectuer un contrôle en bord de route"
  },
  Tuto_Police: {
    id: "873642336",
    title: "tuto-police-juin-2023",
    description: "Effectuer un contrôle en bord de route"
  },
  Testimony_Almy: {
    id: "873642814",
    title: "ludovic_almy",
    description: "Ludovic Almy, responsable d'exploitation dans le déménagement"
  },
  Testimony_Grenom: {
    id: "873642901",
    title: "raphael_grenom",
    description:
      "Raphaël Grenom, directeur d'une agence de livraison de marchandises"
  },
  Testimony_Mace: {
    id: "873642970",
    title: "yoan_mace",
    description: (
      <span>
        Yoann Macé,
        <br />
        gérant d'une entreprise de déménagement
      </span>
    )
  },
  Testimony_Cohen: {
    id: "873642767",
    title: "jeremy_cohen_boulakia",
    description:
      "Jérémy Cohen Boulakia, directeur d'une entreprise de livraison de marchandises"
  },
  Testimony_Kbidi: {
    id: "873642861",
    title: "nicolas_kbidi",
    description: (
      <span>
        Nicolas K'bidi,
        <br />
        déménageur
        <br />
        <br />
      </span>
    )
  }
};

function getCdnUrl(id) {
  return `https://player.vimeo.com/video/${id}?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479`;
}

export function VideoCard({ video, ...props }) {
  const classes = resourceCardsClasses();

  const { id, title, description } = video;
  return (
    <Card variant="outlined" className={classes.card} {...props}>
      <Typography variant={"h5"} className={classes.description}>
        {description}
      </Typography>
      <div style={{ padding: "20rem 0 0 0", position: "relative" }}>
        <iframe
          src={getCdnUrl(id)}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%"
          }}
          title={title}
        ></iframe>
      </div>
    </Card>
  );
}
