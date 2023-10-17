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
    <LandingSection
      title="Prochains webinaires Mobilic"
      className={className}
      id="webinaires"
    >
      <Typography className={classes.sectionIntroText}>
        Inscrivez-vous à l’un de nos webinaires pour assister à une
        démonstration de l’usage de Mobilic et obtenir toutes les réponses à vos
        questions :
      </Typography>
      <WebinarList
        setCantDisplayWebinarsBecauseNoneOrError={
          setCantDisplayWebinarsBecauseNoneOrError
        }
      />
    </LandingSection>
  );
}
