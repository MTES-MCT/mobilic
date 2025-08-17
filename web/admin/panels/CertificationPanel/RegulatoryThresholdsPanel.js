import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import CircularProgress from "@mui/material/CircularProgress";
import RegulatoryThresholdsGrid from "./RegulatoryThresholdsGrid";
import { useCompanyRegulatoryScore } from "../../utils/useCompanyRegulatoryScore";

export default function RegulatoryThresholdsPanel({
  companyWithInfo = {},
  className = ""
}) {
  const {
    regulatoryScore,
    loading,
    error,
    refetch: refreshData
  } = useCompanyRegulatoryScore(companyWithInfo?.id);

  const hasData = Boolean(regulatoryScore?.details?.length);
  const regulatoryDataForGrid = regulatoryScore;

  return (
    <div className={className}>
      {error && (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <div className={cx(fr.cx("fr-callout", "fr-callout--error"))}>
            <h4 className={cx(fr.cx("fr-callout__title"))}>
              Erreur de chargement des données
            </h4>
            <p className={cx(fr.cx("fr-callout__text", "fr-mb-2w"))}>
              Une erreur s'est produite lors du chargement des données
              réglementaires : {error}
            </p>
            <button
              className={cx(fr.cx("fr-btn", "fr-btn--secondary", "fr-btn--sm"))}
              onClick={refreshData}
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {!hasData ? (
        <NoRegulatoryDataMessage loading={loading} />
      ) : (
        <>
          <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
            <div className={cx(fr.cx("fr-col-md-6"))}>
              <h3 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
                Seuils journaliers
              </h3>
              <RegulatoryThresholdsGrid
                regulatoryData={regulatoryDataForGrid}
                showOnlyDaily={true}
              />
            </div>

            <div className={cx(fr.cx("fr-col-md-6"))}>
              <h3 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
                Seuils hebdomadaires
              </h3>
              <RegulatoryThresholdsGrid
                regulatoryData={regulatoryDataForGrid}
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
