import React from "react";
import { Card } from "@mui/material";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import Typography from "@mui/material/Typography";

export function TestimonialCard({ ImageComponent, sentence, author }) {
  const classes = resourceCardsClasses();

  return (
    <Card variant="outlined" className={classes.pressCard}>
      <ImageComponent className={classes.testimonialImage} />
      <Typography className={classes.testimonialSentence}>
        {sentence}
      </Typography>
      <Typography className={classes.testimonialAuthor}>{author}</Typography>
    </Card>
  );
}
