import React from "react";
import { LandingSection, useSectionStyles } from "./LandingSection";
import Typography from "@mui/material/Typography";
import { WebinarList } from "../components/WebinarList";

export function WebinarListSection({ className }) {
  const [
    cantDisplayWebinarsBecauseNoneOrError,
    setCantDisplayWebinarsBecauseNoneOrError
  ] = React.useState();

  const classes = useSectionStyles();

  if (cantDisplayWebinarsBecauseNoneOrError) return null;

  return (
    <LandingSection title="Prochains webinaires Mobilic" className={className}>
      <Typography className={classes.sectionIntroText}>
        Vous pouvez assister à un de nos webinaires pour mieux connaître
        Mobilic, savoir si Mobilic est adapté à vos besoins et comprendre
        comment l'utiliser.
      </Typography>
      <WebinarList
        setCantDisplayWebinarsBecauseNoneOrError={
          setCantDisplayWebinarsBecauseNoneOrError
        }
      />
    </LandingSection>
  );
}
