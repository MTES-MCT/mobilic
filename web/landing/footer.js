import React from "react";
// import {
//   Footer as DSFooter,
//   FooterBody,
//   FooterBodyItem,
//   FooterOperator,
//   FooterBottom,
//   FooterPartners,
//   FooterPartnersLogo,
//   FooterLink,
//   Logo,
//   Link
// } from "@dataesr/react-dsfr";
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
      {/* <DSFooter
        brandTop={
          <>
            République
            <br />
            Française
          </>
        }
        homeLinkProps={{
          href: "/",
          title:
            "Accueil - Nom de l%E2%80%99entit%C3%A9 (minist%C3%A8re, secr%C3%A9tariat d%E2%80%98%C3%A9tat, gouvernement)"
        }}
        accessibility="non compliant"
        contentDescription="Mobilic est un service numérique de l’Etat, soutenu par la
              Direction générale des infrastructures, des transports et des mobilités 
              (DGITM), incubé à la Fabrique Numérique du Ministère de la
              Transition écologique, membre du réseau d’incubateurs
              beta.gouv.fr."
        // operatorLogo={{
        //   alt: "Fabrique du numérique",
        //   imgUrl: "",
        //   orientation: "horizontal"
        // }}
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
        bottomItems={[
          { text: "Mentions légales", linkProps: { to: "legal-notices" } }
        ]}
        domains={["ecologie.gouv.fr", "service-public.fr", "beta.gouv.fr"]}

        //   <FooterBottom>

        //   <FooterLink href="legal-notices">Mentions légales</FooterLink>
        //   <FooterLink href="#" onClick={() => modals.open("cgu")}>
        //     CGU
        //   </FooterLink>
        //   <FooterLink href="/donnees-personnelles">
        //     Données personnelles
        //   </FooterLink>
        //   <FooterLink href="/stats">Statistiques</FooterLink>
        //   <FooterLink
        //     href="https://developers.mobilic.beta.gouv.fr"
        //     target="_blank"
        //     rel="noopener noreferrer"
        //   >
        //     Documentation API
        //   </FooterLink>
        // </FooterBottom>
      /> */}
    </>
  );
}
