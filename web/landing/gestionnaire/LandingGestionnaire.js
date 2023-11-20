import { makeStyles } from "@mui/styles";
import React from "react";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { IntroGestionnaire } from "./sections/IntroGestionnaire";
import { OutroGestionnaire } from "./sections/OutroGestionnaire";
import { SetupMobilic } from "./sections/setup/SetupMobilic";
import { Testimony } from "./sections/Testimony";
import { WhatsMobilic } from "./sections/whatsmobilic/WhatsMobilic";

import { LandingSection, LandingSectionList } from "../sections/LandingSection";
import { usePageTitle } from "../../common/UsePageTitle";

const useStyles = makeStyles(theme => ({
  underlineBlue: {
    backgroundColor: "rgba(49, 132, 255, 0.2)"
  }
}));

export const LandingGestionnaire = () => {
  const classes = useStyles();
  usePageTitle("Accueil Gestionnaire - Mobilic");

  return [
    <Header key="header" />,
    <IntroGestionnaire key="intro" />,
    <LandingSectionList key="sections">
      <LandingSection
        title={
          <>
            Comment{" "}
            <span className={classes.underlineBlue}>mettre en place</span>{" "}
            Mobilic ?
          </>
        }
        innerWidth="lg"
      >
        <SetupMobilic key="setup" />
      </LandingSection>
      <LandingSection
        title={
          <>
            <span className={classes.underlineBlue}>Les gestionnaires</span>{" "}
            parlent de Mobilic{" "}
          </>
        }
        innerWidth="lg"
      >
        <Testimony />
      </LandingSection>
      <LandingSection
        title={
          <>
            En bref,{" "}
            <span className={classes.underlineBlue}>
              qu'est-ce que Mobilic ?
            </span>
          </>
        }
        innerWidth="lg"
      >
        <WhatsMobilic />
      </LandingSection>
    </LandingSectionList>,
    <OutroGestionnaire key="outro" />,
    <Footer key="footer" withFollow={false} />
  ];
};
