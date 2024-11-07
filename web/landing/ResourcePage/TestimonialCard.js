import React from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { resourceCardsClasses } from "./styles/ResourceCardsStyle";
import Typography from "@mui/material/Typography";

export function TestimonialCard({ ImageComponent, sentence, author }) {
  const classes = resourceCardsClasses();

  return (
    <Card variant="outlined" className={classes.pressCard}>
      <Stack direction="column" height="100%">
        <ImageComponent className={classes.testimonialImage} />
        <Typography flexGrow={1} className={classes.testimonialSentence}>
          {sentence}
        </Typography>
        <Typography className={classes.testimonialAuthor}>{author}</Typography>
      </Stack>
    </Card>
  );
}
