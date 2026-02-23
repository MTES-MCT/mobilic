import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Table } from "@codegouvfr/react-dsfr/Table";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { usePageTitle } from "../common/UsePageTitle";
import { FullPageComponent } from "./components/FullPageComponent";

const browserData = [
  ["Google Chrome", "80 ou supérieur"],
  ["Mozilla Firefox", "78 ou supérieur"],
  ["Apple Safari", "14 ou supérieur"],
  ["Microsoft Edge", "80 ou supérieur"],
  ["Samsung Internet", "13 ou supérieur"]
];

const browserHeaders = ["Navigateur", "Version minimale"];

function SectionTitle({ icon, children }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      className={fr.cx("fr-mb-2w")}
    >
      <span className={fr.cx(icon, "fr-icon--lg")} aria-hidden="true" />
      <h2 className={fr.cx("fr-h3", "fr-mb-0")}>{children}</h2>
    </Stack>
  );
}

function PlatformCard({ title, badges, children }) {
  return (
    <Box
      className={fr.cx("fr-p-3w")}
      sx={{
        border: "1px solid var(--border-default-grey)",
        borderRadius: "8px",
        backgroundColor: "var(--background-default-grey)",
        height: "100%"
      }}
    >
      <h3 className={fr.cx("fr-h5", "fr-mb-2w")}>{title}</h3>
      {badges && (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          className={fr.cx("fr-mb-2w")}
        >
          <Badge severity="info" noIcon>
            Minimum : {badges.minimum}
          </Badge>
          {badges.recommended && (
            <Badge severity="success" noIcon>
              Recommandé : {badges.recommended}
            </Badge>
          )}
        </Stack>
      )}
      {children}
    </Box>
  );
}

export default function Compatibility() {
  return (
    <FullPageComponent>
      <CompatibilityContent />
    </FullPageComponent>
  );
}

function CompatibilityContent() {
  usePageTitle("Configuration requise - Mobilic");

  return (
    <Box className={fr.cx("fr-container", "fr-py-6w")}>
      <h1 className={fr.cx("fr-h1")}>Configuration requise</h1>
      <p className={fr.cx("fr-text--lead", "fr-mb-5w")}>
        Mobilic fonctionne sur la plupart des appareils récents. Voici les
        configurations minimales recommandées pour une expérience optimale.
      </p>

      {/* Section 1: Applications mobiles */}
      <section className={fr.cx("fr-mb-5w")}>
        <SectionTitle icon="fr-icon-smartphone-line">
          Applications mobiles
        </SectionTitle>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <PlatformCard
              title="iPhone et iPad"
              badges={{ minimum: "iOS 14", recommended: "iOS 16+" }}
            >
              <ul className={fr.cx("fr-mb-0")}>
                <li>
                  Compatible à partir de l'iPhone 6s et iPad (5e génération)
                </li>
                <li>
                  iPhone 11 ou supérieur recommandé pour une expérience optimale
                </li>
                <li>
                  Pour installer Mobilic sur iOS, ouvrez le site dans Safari et
                  utilisez « Ajouter à l'écran d'accueil »
                </li>
              </ul>
            </PlatformCard>
          </div>
          <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <PlatformCard
              title="Android"
              badges={{ minimum: "Android 10", recommended: "Android 12+" }}
            >
              <ul className={fr.cx("fr-mb-2w")}>
                <li>2 Go de RAM minimum (3 Go recommandé)</li>
                <li>100 Mo d'espace de stockage disponible</li>
                <li>
                  Téléchargez l'application depuis le{" "}
                  <a
                    href="https://play.google.com/store/apps/details?id=fr.gouv.mobilic"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Google Play Store (nouvelle fenêtre)"
                  >
                    Google Play Store
                  </a>
                </li>
              </ul>
              <p className={fr.cx("fr-text--sm", "fr-mb-0")}>
                <strong>Exemples :</strong> Samsung Galaxy A13/A14/A15, Xiaomi
                Redmi Note 11/12/13, Oppo A57/A78, ou tout smartphone acheté
                après 2020.
              </p>
            </PlatformCard>
          </div>
        </div>
      </section>

      {/* Section 2: Navigateurs et Connexion (côte à côte) */}
      <section className={fr.cx("fr-mb-5w")}>
        <SectionTitle icon="fr-icon-global-line">
          Navigateurs et connexion
        </SectionTitle>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <PlatformCard title="Navigateurs web">
              <p className={fr.cx("fr-text--sm", "fr-mb-2w")}>
                Mobilic fonctionne depuis tout appareil connecté, dans un
                navigateur moderne.
              </p>
              <Table headers={browserHeaders} data={browserData} />
            </PlatformCard>
          </div>
          <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <PlatformCard
              title="Connexion réseau"
              badges={{ minimum: "3G", recommended: "4G / WiFi" }}
            >
              <ul className={fr.cx("fr-mb-2w")}>
                <li>
                  Connexion internet requise pour la synchronisation des données
                </li>
                <li>3G minimum, 4G ou WiFi recommandé</li>
              </ul>
              <Alert
                severity="info"
                title="Mode hors-ligne disponible"
                description="Vous pouvez saisir vos activités même sans connexion réseau. Les données seront synchronisées automatiquement au retour de la connexion."
                small
              />
            </PlatformCard>
          </div>
        </div>
      </section>

      <Alert
        severity="warning"
        title="Appareils non supportés"
        description={
          <ul className={fr.cx("fr-mb-0")}>
            <li>Android 9 et versions antérieures</li>
            <li>iOS 13 et versions antérieures</li>
            <li>Téléphones avec moins de 2 Go de RAM</li>
            <li>Opera Mini</li>
          </ul>
        }
      />

      <hr className={fr.cx("fr-hr", "fr-mt-4w")} />
      <p className={fr.cx("fr-text--sm", "fr-hint-text")}>
        Dernière mise à jour : février 2026
      </p>
    </Box>
  );
}
