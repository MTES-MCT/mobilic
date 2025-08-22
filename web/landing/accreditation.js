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
        Mobilic a obtenu l’homologation sécurité décernée par l’Agence nationale
        de la sécurité des systèmes d’information (ANSSI) le 28 septembre 2024
        et ce pour une durée de 6 mois.
      </p>
      <p>
        L’homologation sécurité devra être renouvelée tous les 6 mois dans le
        cadre d'une démarche continue de renforcement de la sécurité des
        services numériques de l’Etat.
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
