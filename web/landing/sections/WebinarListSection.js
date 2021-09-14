import React from "react";
import { LandingSection, useSectionStyles } from "./base";
import Typography from "@material-ui/core/Typography";
import { WebinarList } from "../components/WebinarList";

export function WebinarListSection({ className }) {
  const [webinarDisplayError, setWebinarDisplayError] = React.useState();

  const classes = useSectionStyles();

  if (webinarDisplayError) return null;

  return (
    <LandingSection title="Prochains webinaires Mobilic" className={className}>
      <Typography className={classes.sectionIntroText}>
        Vous pouvez assister à un de nos webinaires pour mieux connaître
        Mobilic, savoir si Mobilic est adapté à vos besoins et comprendre
        comment l'utiliser.
      </Typography>
      <WebinarList setWebinarDisplayError={setWebinarDisplayError} />
    </LandingSection>
  );
}
