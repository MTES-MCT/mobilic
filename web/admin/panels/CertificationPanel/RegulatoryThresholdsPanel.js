import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import CircularProgress from "@mui/material/CircularProgress";
import RegulatoryThresholdsGrid from "./RegulatoryThresholdsGrid";
import { useRegulatoryScore } from "./useRegulatoryScore";
import { useCertificationInfo } from "../../utils/certificationInfo";

export default function RegulatoryThresholdsPanel({ className = "" }) {
  const { loadingInfo } = useCertificationInfo();
  const regulatoryScore = useRegulatoryScore();

  return (
    <div className={className}>
      {loadingInfo ? (
        <NoRegulatoryDataMessage loading={true} />
      ) : !regulatoryScore?.details?.length ? (
        <NoRegulatoryDataMessage loading={false} />
      ) : (
        <>
          <h3 className={cx(fr.cx("fr-h3", "fr-mb-6w"))}>
            Respect des seuils réglementaires
          </h3>
          <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
            <div className={cx(fr.cx("fr-col-md-6"))}>
              <h4 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
                Seuils journaliers
              </h4>
              <RegulatoryThresholdsGrid
                regulatoryData={regulatoryScore}
                showOnlyDaily={true}
              />
            </div>

            <div className={cx(fr.cx("fr-col-md-6"))}>
              <h4 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
                Seuils hebdomadaires
              </h4>
              <RegulatoryThresholdsGrid
                regulatoryData={regulatoryScore}
                showOnlyWeekly={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NoRegulatoryDataMessage({ loading = false }) {
  if (loading) {
    return (
      <div
        className={cx(fr.cx("fr-p-4w"))}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          role="status"
          aria-live="polite"
          aria-label="Chargement des données réglementaires"
        >
          <CircularProgress color="primary" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className={cx(fr.cx("fr-callout", "fr-callout--info"))}>
      <h4 className={cx(fr.cx("fr-callout__title"))}>
        Aucune donnée réglementaire disponible
      </h4>
      <div className={cx(fr.cx("fr-callout__text", "fr-mb-3w"))}>
        <p style={{ textAlign: "justify" }}>
          Aucune donnée sur les seuils réglementaires n'est disponible pour
          cette entreprise.
        </p>
      </div>

      <div className={cx(fr.cx("fr-highlight"))}>
        <p className={cx(fr.cx("fr-text--bold", "fr-mb-1w"))}>Suggestions :</p>
        <ul className={cx(fr.cx("fr-mb-0"))} style={{ textAlign: "justify" }}>
          <li>Vérifiez que des activités ont été saisies</li>
          <li>Assurez-vous que les salariés ont bien utilisé Mobilic</li>
          <li>
            Les calculs réglementaires peuvent prendre quelques minutes à être
            générés
          </li>
        </ul>
      </div>
    </div>
  );
}
