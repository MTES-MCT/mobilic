import React from "react";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import { MainCtaButton } from "../../pwa/components/MainCtaButton";

export function PressCard({ ImageComponent, articleLink }) {
  const classes = resourceCardsClasses();

  return (
    <Card variant="outlined" className={classes.pressCard}>
      <ImageComponent className={classes.pressImage} />
      <br />
      <MainCtaButton
        aria-label="Lire l'article"
        href={articleLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        Lire l'article
      </MainCtaButton>
    </Card>
  );
}
