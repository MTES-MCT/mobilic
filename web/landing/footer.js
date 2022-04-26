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
// import Hidden from "@mui/material/Hidden";
import FranceRelanceLogo from "common/assets/images/sponsor-logos/france_relance.png";
import NextGenerationEULogo from "common/assets/images/sponsor-logos/next_generation_eu.png";
// import CSDLogo from "common/assets/images/sponsor-logos/csd.jpg";
// import DemenagerFacileLogo from "common/assets/images/sponsor-logos/demenager-facile.png";
// import OTRELogo from "common/assets/images/sponsor-logos/otre.png";
import { FabNumIcon } from "common/utils/icons";

export function Footer() {
  const modals = useModals();
  return (
    <>
      <Follow />
      <DSFooter>
        <FooterBody
          description="Mobilic est un service numérique de l’Etat, soutenue par la
              Direction générale des infrastructures des transports et de la
              mer (DGITM), incubé à la Fabrique Numérique du Ministère de la
              Transition écologique, membre du réseau d’incubateurs
              beta.gouv.fr."
          // description={
          //   <>
          //     <span>
          //       Mobilic est un service numérique de l’Etat, soutenue par la
          //       Direction générale des infrastructures des transports et de la
          //       mer (DGITM), incubé à la Fabrique Numérique du Ministère de la
          //       Transition écologique, membre du réseau d’incubateurs
          //       beta.gouv.fr.
          //     </span>
          //     <Hidden smDown>
          //       <img
          //         src="/landing-qrcode.svg"
          //         height={120}
          //         alt="QR Code pour accéder à mobilic sur smartphone"
          //         style={{ padding: "0 4px" }}
          //       />
          //     </Hidden>
          //   </>
          // }
        >
          <Logo>Ministère de la Transition écologique</Logo>
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
          {/* <FooterPartnersLogo
            imageSrc={CSDLogo}
            imageAlt="Chambre syndicale du déménagement"
          />
          <FooterPartnersLogo
            imageSrc={DemenagerFacileLogo}
            imageAlt="Déménager Facile"
          />
          <FooterPartnersLogo
            imageSrc={OTRELogo}
            imageAlt="OTRE - Faisons route ensemble"
          /> */}
        </FooterPartners>
        <FooterBottom>
          <FooterLink>Accessibilité : non conforme</FooterLink>
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
