import React from "react";
import { Header } from "../common/Header";
import { Footer } from "./footer";
import { WebinarListSection } from "./sections/WebinarListSection";
import { IntroSection } from "./sections/IntroSection";
import { TalkingAboutUsSection } from "./sections/TalkingAboutUsSection";
import { usePageTitle } from "../common/UsePageTitle";
import { VideoSection } from "./sections/VideoSection";
import { Main } from "../common/semantics/Main";
import { LoginBanner } from "./components/LoginBanner";
import { AdminSection } from "./sections/AdminSection";
import { SoftwareSection } from "./sections/SoftwareSection";

export const Landing = () => {
  usePageTitle("Accueil - Mobilic");
  return (
    <>
      <Header />
      <Main maxWidth={false}>
        <LoginBanner />
        <IntroSection />
        <VideoSection />
        <AdminSection />
        <SoftwareSection />
        {process.env.REACT_APP_FETCH_WEBINARS && <WebinarListSection />}
        <TalkingAboutUsSection
          grayBackground={process.env.REACT_APP_FETCH_WEBINARS}
        />
      </Main>
      <Footer />
    </>
  );
};
