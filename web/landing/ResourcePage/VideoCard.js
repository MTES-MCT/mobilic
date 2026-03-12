import React from "react";
import Typography from "@mui/material/Typography";
import { Box, Card, Stack } from "@mui/material";
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
    id: "1092714544",
    title: "gestionnaire-utilisation-mai-2025",
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
    id: "1092713758",
    title: "tuto-ctt-it-mai-2025",
    description: "Effectuer un contrôle en bord de route"
  },
  Tuto_Police: {
    id: "874704140",
    title: "tuto-force-en-tenu-septembre-2023",
    description: "Effectuer un contrôle en bord de route"
  },
  Testimony_Almy: {
    id: "873642814",
    title: "ludovic_almy",
    author: "Ludovic Almy",
    position: "Responsable d'exploitation dans le déménagement",
  },
  Testimony_Grenom: {
    id: "873642901",
    title: "raphael_grenom",
    author: "Raphaël Grenom",
    position: "Directeur d'une agence de livraison de marchandises",
  },
  Testimony_Mace: {
    id: "873642970",
    title: "yoan_mace",
    author: "Yoann Macé",
    position: "Gérant d'une entreprise de déménagement",
  },
  Testimony_Cohen: {
    id: "873642767",
    title: "jeremy_cohen_boulakia",
    author: "Jérémy Cohen Boulakia",
    position: "Directeur d'une entreprise de livraison de marchandises",
  },
  Testimony_Kbidi: {
    id: "873642861",
    title: "nicolas_kbidi",
    author: "Nicolas K'bidi",
    position: "Déménageur",
  },
};

function getCdnUrl(id) {
  return `https://player.vimeo.com/video/${id}?badge=0&amp;autopause=0&amp;quality_selector=1&amp;progress_bar=1&amp;player_id=0&amp;app_id=58479`;
}

export const VideoFrame = ({ id, title, aspectRatio = "16/9" }) => (
  <Box position="relative" width="100%" sx={{ aspectRatio }}>
    <iframe
      src={getCdnUrl(id)}
      allow="autoplay; fullscreen; picture-in-picture"
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      }}
      title={title}
    ></iframe>
  </Box>
);

export function VideoCard({
  video,
  aspectRatio = "16/9",
  titleProps = {},
  ...props
}) {
  const classes = resourceCardsClasses();

  const { id, title, description, author, position } = video;
  return (
    <Card variant="outlined" className={classes.card} {...props}>
      <Stack direction="column" justifyContent="space-between" height="100%">
        {description && (
      <Typography
        variant={"h5"}
        className={classes.description}
        {...titleProps}
      >
        {description}
      </Typography>
        )}
        <Box mb={2}>
          {author && (
            <Typography className={classes.testimonialAuthor}>
              {author}
            </Typography>
          )}
          {position && <Typography>{position}</Typography>}
        </Box>
        <VideoFrame id={id} title={title} aspectRatio={aspectRatio} />
      </Stack>
    </Card>
  );
}
