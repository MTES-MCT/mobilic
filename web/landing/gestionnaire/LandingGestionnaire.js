import React, { useEffect } from "react";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { IntroGestionnaire } from "./sections/IntroGestionnaire";
import { OutroGestionnaire } from "./sections/OutroGestionnaire";
import { SetupMobilic } from "./sections/setup/SetupMobilic";
import { Testimony } from "./sections/Testimony";
import { WhatsMobilic } from "./sections/whatsmobilic/WhatsMobilic";

import { LandingSection, LandingSectionList } from "../sections/LandingSection";
import { usePageTitle } from "../../common/usePageTitle";
import { makeStyles } from "@mui/styles";
import trackAds from "common/utils/trackAds";

const useStyles = makeStyles(theme => ({
  underlineBlue: {
    backgroundColor: "rgba(49, 132, 255, 0.2)"
  }
}));

export const LandingGestionnaire = () => {
  const classes = useStyles();
  usePageTitle("Accueil Gestionnaire - Mobilic");

  useEffect(() => {
    if (process.env.REACT_APP_GOOGLE_ADS) {
      // Inspired by https://developers.axeptio.eu/cookies/cookies-integration
      trackAds.initAxeptio();

      if (!window._axcb) {
        window._axcb = [];
      }
      window._axcb.push(axeptio => {
        axeptio.on("cookies:complete", choices => {
          if (choices.google_ads) {
            console.debug("Consent given for google ads... launch script");
            trackAds.initGoogleAds();
          } else {
            console.debug("Consent refused for google ads... remove script");
            trackAds.removeGoogleAds();
          }
        });

        // See https:// developers.axeptio.eu/site-integration/special-cases-spa-or-react
        axeptio.on("consent:saved", () => {
          window.location.reload();
        });
      });
    } else {
      console.debug("Google ads is deactivated in this env");
    }
  }, []);

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
