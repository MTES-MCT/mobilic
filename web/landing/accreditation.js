import React from "react";
import { usePageTitle } from "../common/UsePageTitle";

import DesktopImage from "common/assets/images/security-accreditation/homologation.desktop.png";
import TabletteImage from "common/assets/images/security-accreditation/homologation.tablette.png";
import MobileImage from "common/assets/images/security-accreditation/homologation.mobile.png";
import { useIsWidthDown, useIsWidthUp } from "common/utils/useWidth";
import { FullPageComponent } from "./components/FullPageComponent";
import { ExternalLink } from "../common/ExternalLink";

export const SecurityAccreditation = () => (
  <FullPageComponent>
    <InnerSecurityAccreditation />
  </FullPageComponent>
);

const InnerSecurityAccreditation = () => {
  usePageTitle("Homologation sécurité - Mobilic");
  const isDesktop = useIsWidthUp("lg");
  const isMobile = useIsWidthDown("sm");

  return (
    <>
      <h1>Sécurité</h1>
      <p>
        Mobilic a obtenu l’homologation sécurité décernée par l’Agence 
        nationale de la sécurité des systèmes d’information (ANSSI) 
        le 22 décembre 2025.
      </p>
      <p>
        Mobilic est hébergé chez{" "}
        <ExternalLink url="https://www.ovhcloud.com/fr/" text="OVH" />,
        hébergeur qualifié SecNumCloud (services numériques respectant les plus
        hauts standards de sécurité de l'ANSSI).
      </p>
      <img
        src={isDesktop ? DesktopImage : isMobile ? MobileImage : TabletteImage}
        alt="Homologation de sécurité"
        style={{ width: "100%", height: "auto" }}
      />
    </>
  );
};
