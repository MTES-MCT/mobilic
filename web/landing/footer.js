import React from "react";
import {
  Footer as DSFooter,
  FooterBody,
  FooterBodyItem,
  FooterOperator,
  FooterBottom,
  FooterPartners,
  FooterPartnersLogo,
  FooterLink,
  Logo,
  Link
} from "@dataesr/react-dsfr";
import { useModals } from "common/utils/modals";
import { Follow } from "./follow";
import FranceRelanceLogo from "common/assets/images/sponsor-logos/france_relance.jpg";
import NextGenerationEULogo from "common/assets/images/sponsor-logos/next_generation_eu.png";
import { FabNumIcon } from "common/utils/icons";

export function Footer() {
  const modals = useModals();
  return (
    <>
      <Follow />
      <DSFooter>
        <FooterBody
          description="Mobilic est un service numérique de l’Etat, soutenu par la
              Direction générale des infrastructures, des transports et des mobilités 
              (DGITM), incubé à la Fabrique Numérique du Ministère de la
              Transition écologique, membre du réseau d’incubateurs
              beta.gouv.fr."
        >
          <Logo hrefTitle="Retour à l’accueil" splitCharacter={10}>
            République Française
          </Logo>
          <FooterOperator>
            <FabNumIcon />
          </FooterOperator>
          <FooterBodyItem>
            <Link href="mailto:mobilic@beta.gouv.fr">Nous contacter</Link>
          </FooterBodyItem>
          <FooterBodyItem>
            <Link href="https://www.ecologie.gouv.fr/">ecologie.gouv.fr</Link>
          </FooterBodyItem>
          <FooterBodyItem>
            <Link href="https://service-public.fr">service-public.fr</Link>
          </FooterBodyItem>
          <FooterBodyItem>
            <Link href="https://beta.gouv.fr">beta.gouv.fr</Link>
          </FooterBodyItem>
        </FooterBody>
        <FooterPartners>
          <FooterPartnersLogo
            imageSrc={FranceRelanceLogo}
            imageAlt="France Relance"
          />
          <FooterPartnersLogo
            imageSrc={NextGenerationEULogo}
            imageAlt="Financé par NextGeneration EU"
          />
        </FooterPartners>
        <FooterBottom>
          <FooterLink href="/accessibility">
            Accessibilité : non conforme
          </FooterLink>
          <FooterLink href="#" onClick={() => modals.open("cgu")}>
            Conditions générales d'utilisation
          </FooterLink>
          <FooterLink href="/stats">Statistiques</FooterLink>
          <FooterLink
            href="https://developers.mobilic.beta.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation API
          </FooterLink>
        </FooterBottom>
      </DSFooter>
    </>
  );
}
