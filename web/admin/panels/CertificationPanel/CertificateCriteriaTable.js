import React from "react";
import { Stack, Typography } from "@mui/material";
import {
  TextBadge,
  useCompanyCertification
} from "../../../common/hooks/useCompanyCertification";
import classNames from "classnames";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";

const MEDALS = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];

const CERTIFICATE_LEVELS = {
  BRONZE: { logInRealTime: 60, adminChanges: 30, compliancy: 0 },
  SILVER: { logInRealTime: 70, adminChanges: 20, compliancy: 2 },
  GOLD: { logInRealTime: 80, adminChanges: 10, compliancy: 4 },
  DIAMOND: { logInRealTime: 95, adminChanges: 1, compliancy: 6 }
};

const CRITERIA_LABELS = {
  logInRealTime: "Temps de travail enregistrés en temps réel",
  adminChanges: "Temps de travail modifiés par le gestionnaire",
  compliancy: "Respect des seuils réglementaires"
};

export default function CertificateCriteriaTable({ companyWithInfo = {} }) {
  const {
    hasData,
    medal,
    logInRealTime,
    adminChanges,
    compliancy,
    isCertified
  } = useCompanyCertification(companyWithInfo.currentCompanyCertification);

  const renderHeader = m => {
    const isActive = m === medal;
    return (
      <th
        className={classNames(m.toLowerCase(), {
          active: isActive
        })}
        key={m}
      >
        <TextBadge medal={m} isWhiteBackground={!isActive} />
      </th>
    );
  };

  const renderDataCell = (m, value, suffix) => {
    const isActive = medal === m;
    return (
      <td
        key={m}
        className={classNames("value", m.toLowerCase(), {
          active: isActive
        })}
      >
        {value}
        <span className="suffix">{suffix}</span>
      </td>
    );
  };

  const renderScoreCell = (value, suffix = "%") => (
    <td className={classNames("my-score", "value")}>
      {hasData ? (
        <>
          {value}
          <span className="suffix">{suffix}</span>
        </>
      ) : (
        "-"
      )}
    </td>
  );

  const renderCriteriaCell = text => <td className="definition">{text}</td>;

  return (
    <Stack direction="column" gap={4}>
      {!isCertified ? (
        <Typography component="h2" variant="h5">
          Les critères de certification
        </Typography>
      ) : (
        <Stack direction="column" gap={1}>
          <Typography component="h2" variant="h5">
            Votre niveau de certification
          </Typography>
          <Typography>
            au 1er{" "}
            {new Date().toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric"
            })}
          </Typography>
        </Stack>
      )}
      <table className="certificate">
        <thead>
          <tr>
            <th className="base">Critères</th>
            {MEDALS.map(m => renderHeader(m))}
            <th className="your-score">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                Votre score
                {!hasData && (
                  <Tooltip
                    title="Le calcul de votre score n'a pas été réalisé car votre entreprise a enregistré moins de 12 missions dans le mois précédent"
                    kind="hover"
                  >
                    <i
                      className="fr-icon-question-line fr-icon--md"
                      style={{ color: "white" }}
                    />
                  </Tooltip>
                )}
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            {renderCriteriaCell(CRITERIA_LABELS.logInRealTime)}
            {MEDALS.map(m =>
              renderDataCell(m, CERTIFICATE_LEVELS[m].logInRealTime, "%")
            )}
            {renderScoreCell((logInRealTime * 100).toFixed(0))}
          </tr>
          <tr>
            {renderCriteriaCell(CRITERIA_LABELS.adminChanges)}
            {MEDALS.map(m =>
              renderDataCell(m, CERTIFICATE_LEVELS[m].adminChanges, "%")
            )}
            {renderScoreCell((adminChanges * 100).toFixed(0))}
          </tr>
          <tr>
            {renderCriteriaCell(CRITERIA_LABELS.compliancy)}
            {MEDALS.map(m =>
              renderDataCell(m, CERTIFICATE_LEVELS[m].compliancy, "/6")
            )}
            {renderScoreCell(compliancy, "/6")}
          </tr>
        </tbody>
      </table>
    </Stack>
  );
}
