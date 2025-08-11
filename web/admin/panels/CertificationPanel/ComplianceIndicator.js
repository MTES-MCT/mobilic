import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
const getComplianceStatus = isCompliant => ({
  severity: isCompliant ? "success" : "error",
  icon: isCompliant ? "✅" : "❌",
  label: isCompliant ? "Respecté" : "Non respecté",
  bgColor: isCompliant ? "#DFFEE6" : "#FFF4F4",
  textColor: isCompliant ? "#18753C" : "#CE0500"
});

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
    <output
      className={cx(
        fr.cx(
          "fr-callout",
          `fr-callout--${complianceStatus.severity}`,
          "fr-mb-2w"
        ),
        className
      )}
      aria-live="polite"
      data-testid={`compliance-indicator-${isCompliant ? "success" : "error"}`}
    >
      <h4 className={cx(fr.cx("fr-callout__title"))}>
        <span className={cx(fr.cx("fr-mr-1w"))}>{complianceStatus.icon}</span>
        {thresholdLabel}
      </h4>
      {showDetails && (
        <p className={cx(fr.cx("fr-callout__text", "fr-mb-0"))}>
          {thresholdExplanation}
        </p>
      )}
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
    <div
      className={cx(fr.cx("fr-py-2w", "fr-px-3w"), className)}
      style={{
        backgroundColor: complianceStatus.bgColor,
        borderLeft: `4px solid ${complianceStatus.textColor}`
      }}
      aria-label={`${thresholdLabel}: ${complianceStatus.label}`}
    >
      <div
        className={cx(
          fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")
        )}
      >
        <div className={cx(fr.cx("fr-col-auto"))}>
          <span
            className={cx(fr.cx("fr-text--lg"))}
            style={{ color: complianceStatus.textColor }}
          >
            {complianceStatus.icon}
          </span>
        </div>
        <div className={cx(fr.cx("fr-col"))}>
          <span
            className={cx(fr.cx("fr-text--md", "fr-text--bold"))}
            style={{ color: complianceStatus.textColor }}
          >
            {thresholdLabel}
          </span>
        </div>
        <div className={cx(fr.cx("fr-col-auto"))}>
          <span
            className={cx(fr.cx("fr-icon-arrow-down-s-line"))}
            style={{ color: complianceStatus.textColor }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
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
