import React from "react";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { OPEN_PRESS_ARTICLE } from "common/utils/matomoTags";
import { LoadingButton } from "common/components/LoadingButton";

export function PressCard({
  ImageComponent,
  articleLink,
  buttonLabel = "Lire l'article",
  matomoTag
}) {
  const classes = resourceCardsClasses();
  const { trackEvent } = useMatomo();

  return (
    <Card variant="outlined" className={classes.pressCard}>
      <ImageComponent className={classes.pressImage} />
      <br />
      <LoadingButton
        href={articleLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(OPEN_PRESS_ARTICLE(matomoTag))}
      >
        {buttonLabel}
      </LoadingButton>
    </Card>
  );
}
