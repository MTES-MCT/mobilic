import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import RegulatoryThresholdsGrid from "./RegulatoryThresholdsGrid";
import { useCompanyCertification } from "../../../common/hooks/useCompanyCertification";
import { Typography } from "@mui/material";

export default function RegulatoryThresholdsPanel({
  companyWithInfo,
  className = ""
}) {
  const { compliancyReport } = useCompanyCertification(
    companyWithInfo.currentCompanyCertification
  );

  return (
    <div className={className}>
      {!compliancyReport ? (
        <NoRegulatoryDataMessage />
      ) : (
        <>
          <Typography component="h2" variant="h5" mb={2}>
            Respect des seuils réglementaires
          </Typography>
          <RegulatoryThresholdsGrid compliancyReport={compliancyReport} />
        </>
      )}
    </div>
  );
}

function NoRegulatoryDataMessage() {
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
