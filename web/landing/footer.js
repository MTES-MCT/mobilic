import React from "react";
import { Footer as DSFooter } from "@codegouvfr/react-dsfr/Footer";
import { Follow } from "./follow";
import { CGU_EXTERNAL_URL } from "./cgu";

export function Footer({ withFollow = true }) {
  return (
    <>
      {withFollow && <Follow />}
      <DSFooter
        brandTop={
          <>
            Ministères
            <br />
            Territoires
            <br />
            Écologie
            <br />
            Logement
          </>
        }
        homeLinkProps={{
          to: "/",
          title: "Accueil - Mobilic"
        }}
        accessibility="non compliant"
        accessibilityLinkProps={{ to: "/accessibility" }}
        contentDescription="Mobilic est un service numérique de l’Etat, soutenu par la Direction générale des infrastructures, des transports et des mobilités (DGITM), incubé à la Fabrique Numérique des ministères Territoires, Ecologie, Logement, membre du réseau d’incubateurs beta.gouv.fr."
        operatorLogo={{
          alt: "Fabrique du numérique",
          imgUrl: "https://beta.gouv.fr/img/incubators/logo_fabnum_mtes.png",
          orientation: "horizontal"
        }}
        termsLinkProps={{
          to: "/legal-notices"
        }}
        bottomItems={[
          {
            text: "Sécurité",
            linkProps: { to: "security-accreditation" }
          },
          {
            text: "CGU",
            linkProps: {
              to: CGU_EXTERNAL_URL,
              target: "_blank",
              rel: "noopener noreferrer"
            }
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
