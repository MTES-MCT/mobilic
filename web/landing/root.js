import React from "react";
import { Header } from "../common/Header";
import { Footer } from "./footer";
import { LandingSectionList } from "./sections/LandingSection";
import { WebinarListSection } from "./sections/WebinarListSection";
import { IntroSection } from "./sections/IntroSection";
import { TalkingAboutUsSection } from "./sections/TalkingAboutUsSection";
import { usePageTitle } from "../common/UsePageTitle";
import Stack from "@mui/material/Stack";
import { VideoSection } from "./sections/VideoSection";
import { WhoSection } from "./sections/WhoSection";
import { WhatToKnowSection } from "./sections/WhatToKnowSection";
import { Main } from "../common/semantics/Main";
import { Container } from "@mui/material";
import { LoginBanner } from "./components/LoginBanner";

export const Landing = () => {
  usePageTitle("Accueil - Mobilic");

  return (
    <>
      <Header />
      <Main maxWidth={false}>
        <LoginBanner />
        <IntroSection />
        <VideoSection />
        {process.env.REACT_APP_FETCH_WEBINARS && <WebinarListSection />}
        {/* <Container maxWidth="lg">
          <Stack direction="column" gap={8} sx={{ marginY: 4 }}>
            <LandingSectionList>
              <VideoSection />
              {process.env.REACT_APP_FETCH_WEBINARS && <WebinarListSection />}
              <WhoSection />
              <WhatToKnowSection />
              <TalkingAboutUsSection />
            </LandingSectionList>
          </Stack>
        </Container> */}
      </Main>
      <Footer />
    </>
  );
};
