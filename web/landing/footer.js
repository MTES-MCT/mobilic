import React from "react";
import { Footer as DSFooter } from "@codegouvfr/react-dsfr/Footer";
import { useModals } from "common/utils/modals";
import { Follow } from "./follow";
import FranceRelanceLogo from "common/assets/images/sponsor-logos/france_relance.jpg";
import NextGenerationEULogo from "common/assets/images/sponsor-logos/next_generation_eu.png";
// import { FabNumIcon } from "common/utils/icons";

export function Footer({ withFollow = true }) {
  const modals = useModals();
  return (
    <>
      {withFollow && <Follow />}
      <DSFooter
        brandTop={
          <>
            République
            <br />
            Française
          </>
        }
        homeLinkProps={{
          href: "/",
          title: "Accueil - Mobilic"
        }}
        accessibility="non compliant"
        contentDescription="Mobilic est un service numérique de l’Etat, soutenu par la
              Direction générale des infrastructures, des transports et des mobilités 
              (DGITM), incubé à la Fabrique Numérique du Ministère de la
              Transition écologique, membre du réseau d’incubateurs
              beta.gouv.fr."
        operatorLogo={{
          alt: "Fabrique du numérique",
          imgUrl: "",
          orientation: "horizontal"
        }}
        partnersLogos={{
          sub: [
            {
              alt: "France Relance",
              imgUrl: { FranceRelanceLogo }
            },
            {
              alt: "Financé par NextGeneration EU",
              imgUrl: { NextGenerationEULogo }
            }
          ]
        }}
        termsLinkProps={{
          to: "legal-notices"
        }}
        bottomItems={[
          {
            text: "CGU",
            linkProps: { to: "#", onClick: () => modals.open("cgu") }
          },
          {
            text: "Données personnelles",
            linkProps: { to: "donnees-personnelles" }
          },
          {
            text: "Statistiques",
            linkProps: { to: "stats" }
          },
          {
            text: "Documentation API",
            linkProps: {
              to: "https://developers.mobilic.beta.gouv.fr",
              target: "_blank",
              rel: "noopener noreferrer"
            }
          }
        ]}
        domains={["ecologie.gouv.fr", "service-public.fr", "beta.gouv.fr"]}
        license={
          <>
            Sauf mention explicite de propriété intellectuelle détenue par des
            tiers, les contenus de ce site sont proposés sous{" "}
            <a
              href="https://github.com/MTES-MCT/mobilic/blob/master/LICENSE.txt"
              target="_blank"
              rel="noreferrer"
            >
              licence MIT
            </a>
          </>
        }
      />
    </>
  );
}
