import React from "react";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { getComplianceStatus } from "./regulatoryThresholdConstants";

export default function ComplianceIndicator({
  isCompliant = false,
  thresholdLabel = "",
  thresholdExplanation = "",
  mode = "alert",
  size = "medium",
  showDetails = false,
  className = ""
}) {
  const complianceStatus = getComplianceStatus(isCompliant);

  if (mode === "icon-only") {
    return (
      <output
        className={cx(fr.cx("fr-text--lg"), className)}
        aria-label={`${thresholdLabel}: ${complianceStatus.label}`}
        title={`${thresholdLabel}: ${complianceStatus.label}`}
      >
        {complianceStatus.icon}
      </output>
    );
  }

  if (mode === "badge") {
    return (
      <output>
        <Badge
          severity={complianceStatus.severity}
          noIcon={false}
          small={size === "small"}
          className={cx(className)}
          aria-label={`${thresholdLabel}: ${complianceStatus.label}`}
        >
          <span className={cx(fr.cx("fr-mr-1v"))}>{complianceStatus.icon}</span>
          {complianceStatus.label}
        </Badge>
      </output>
    );
  }

  return (
    <output>
      <Alert
        severity={complianceStatus.severity}
        title={`${complianceStatus.icon} ${thresholdLabel}`}
        description={showDetails ? thresholdExplanation : undefined}
        className={cx(fr.cx("fr-mb-2w"), className)}
        aria-live="polite"
        data-testid={`compliance-indicator-${
          isCompliant ? "success" : "error"
        }`}
      />
    </output>
  );
}

export function CompactComplianceRow({
  isCompliant,
  thresholdLabel,
  className = ""
}) {
  const complianceStatus = getComplianceStatus(isCompliant);

  return (
    <output
      className={cx(fr.cx("fr-grid-row", "fr-grid-row--middle"), className)}
      aria-label={`${thresholdLabel}: ${complianceStatus.label}`}
    >
      <div className={cx(fr.cx("fr-col-auto", "fr-pr-1w"))}>
        <span
          className={cx(
            fr.cx("fr-text--lg"),
            complianceStatus.severity === "success"
              ? fr.cx("fr-text-success--green-emeraude")
              : fr.cx("fr-text-error--red-marianne")
          )}
        >
          {complianceStatus.icon}
        </span>
      </div>

      <div className={cx(fr.cx("fr-col"))}>
        <span
          className={cx(
            fr.cx("fr-text--sm"),
            isCompliant
              ? fr.cx("fr-text-success--green-emeraude")
              : fr.cx("fr-text-error--red-marianne")
          )}
        >
          {thresholdLabel}
        </span>
      </div>
    </output>
  );
}

export function ComplianceStatusSummary({
  compliantCount,
  totalCount,
  categoryLabel,
  className = ""
}) {
  const allCompliant = compliantCount === totalCount;
  const noneCompliant = compliantCount === 0;

  let severity, icon, message;

  if (allCompliant) {
    severity = "success";
    icon = "✅";
    message = `Tous les seuils ${categoryLabel.toLowerCase()} sont respectés`;
  } else if (noneCompliant) {
    severity = "error";
    icon = "⚠️";
    message = `Aucun seuil ${categoryLabel.toLowerCase()} n'est respecté`;
  } else {
    severity = "warning";
    icon = "⚠️";
    message = `${compliantCount}/${totalCount} seuils ${categoryLabel.toLowerCase()} respectés`;
  }

  return (
    <output
      className={cx(
        fr.cx("fr-callout", `fr-callout--${severity}`, "fr-mb-2w"),
        className
      )}
      aria-label={message}
    >
      <h4 className={cx(fr.cx("fr-callout__title"))}>
        <span className={cx(fr.cx("fr-mr-1w"))}>{icon}</span>
        {categoryLabel}
      </h4>
      <p className={cx(fr.cx("fr-callout__text", "fr-mb-0"))}>{message}</p>
    </output>
  );
}
