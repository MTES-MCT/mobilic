import React from "react";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { getComplianceStatus } from "./regulatoryThresholdConstants";

/**
 * ComplianceIndicator - Pure DSFR v1.26 Component
 * Displays ✅/⚠️ compliance status matching Figma designs
 * Supports both Alert (full display) and Badge (compact) modes
 */
export default function ComplianceIndicator({
  isCompliant,
  thresholdLabel,
  thresholdExplanation,
  mode = "alert", // "alert" | "badge" | "icon-only"
  size = "medium", // For badge mode: "small" | "medium"
  showDetails = false,
  className = ""
}) {
  const complianceStatus = getComplianceStatus(isCompliant);

  // Icon-only mode for accordion headers
  if (mode === "icon-only") {
    return (
      <span
        className={cx(fr.cx("fr-text--lg"), className)}
        role="status"
        aria-label={`${thresholdLabel}: ${complianceStatus.label}`}
        title={`${thresholdLabel}: ${complianceStatus.label}`}
      >
        {complianceStatus.icon}
      </span>
    );
  }

  // Badge mode for compact display
  if (mode === "badge") {
    return (
      <Badge
        severity={complianceStatus.severity}
        noIcon={false}
        small={size === "small"}
        className={cx(className)}
        // DSFR v1.26: Enhanced ARIA attributes
        role="status"
        aria-label={`${thresholdLabel}: ${complianceStatus.label}`}
      >
        <span className={cx(fr.cx("fr-mr-1v"))}>{complianceStatus.icon}</span>
        {complianceStatus.label}
      </Badge>
    );
  }

  // Full Alert mode (default) - matches Figma accordion expanded state
  return (
    <Alert
      severity={complianceStatus.severity}
      title={`${complianceStatus.icon} ${thresholdLabel}`}
      description={showDetails ? thresholdExplanation : undefined}
      className={cx(fr.cx("fr-mb-2w"), className)}
      // DSFR v1.26: Improved fieldset ARIA attributes (automatic)
      role="status"
      aria-live="polite"
      data-testid={`compliance-indicator-${isCompliant ? "success" : "error"}`}
    />
  );
}

/**
 * CompactComplianceRow - Special component for threshold list items
 * Shows compliance status in a row format matching Figma designs
 */
export function CompactComplianceRow({
  isCompliant,
  thresholdLabel,
  className = ""
}) {
  const complianceStatus = getComplianceStatus(isCompliant);

  return (
    <div
      className={cx(fr.cx("fr-grid-row", "fr-grid-row--middle"), className)}
      role="status"
      aria-label={`${thresholdLabel}: ${complianceStatus.label}`}
    >
      {/* Status Icon */}
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

      {/* Threshold Label */}
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
    </div>
  );
}

/**
 * ComplianceStatusSummary - Shows overall compliance for a category
 * Used in grid headers to show daily/weekly compliance overview
 */
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
    <div
      className={cx(
        fr.cx("fr-callout", `fr-callout--${severity}`, "fr-mb-2w"),
        className
      )}
      role="status"
      aria-label={message}
    >
      <h4 className={cx(fr.cx("fr-callout__title"))}>
        <span className={cx(fr.cx("fr-mr-1w"))}>{icon}</span>
        {categoryLabel}
      </h4>
      <p className={cx(fr.cx("fr-callout__text", "fr-mb-0"))}>{message}</p>
    </div>
  );
}

// Default props
ComplianceIndicator.defaultProps = {
  isCompliant: false,
  thresholdLabel: "",
  thresholdExplanation: "",
  mode: "alert",
  size: "medium",
  showDetails: false,
  className: ""
};
