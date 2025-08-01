import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

/**
 * RegulatoryThresholdsFilters - Pure DSFR v1.26 Component
 * Renders the top filtering section as shown in certificat_*_regulation.png
 * Includes employee dropdown and date range inputs with DSFR styling
 */
export default function RegulatoryThresholdsFilters({
  selectedEmployee,
  onEmployeeChange,
  dateRange,
  onDateRangeChange,
  employeeList = [],
  loading = false
}) {
  // Employee options for Select component
  const employeeOptions = [
    { label: "Tous les salariés", value: "all" },
    ...employeeList.map(employee => ({
      label: `${employee.firstName} ${employee.lastName}`,
      value: employee.id.toString()
    }))
  ];

  // Handle date change events
  const handleStartDateChange = event => {
    const newStartDate = event.target.value;
    onDateRangeChange({
      ...dateRange,
      start: newStartDate ? new Date(newStartDate) : null
    });
  };

  const handleEndDateChange = event => {
    const newEndDate = event.target.value;
    onDateRangeChange({
      ...dateRange,
      end: newEndDate ? new Date(newEndDate) : null
    });
  };

  // Format date for input value (YYYY-MM-DD)
  const formatDateForInput = date => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className={cx(fr.cx("fr-container"))}>
      {/* Explanatory text matching Figma designs */}
      <div className={cx(fr.cx("fr-mb-3w"))}>
        <h3 className={cx(fr.cx("fr-h6", "fr-mb-1w"))}>
          Qu'est-ce que les seuils réglementaires ?
        </h3>
        <p className={cx(fr.cx("fr-text--sm", "fr-mb-2w"))}>
          Les seuils réglementaires sont les seuils journaliers et hebdomadaires
          prévus par la réglementation en vigueur dans le transport routier
          léger. Le calcul effectué par Mobilic est adapté en fonction du type
          d'activité renseigné pour chaque salarié.
        </p>
      </div>

      {/* Filter Controls - Three columns as shown in Figma */}
      <div
        className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-4w"))}
      >
        {/* Employee Selection */}
        <div className={cx(fr.cx("fr-col-md-4"))}>
          <Select
            label="Salarié(s)"
            nativeSelectProps={{
              value: selectedEmployee,
              onChange: event => onEmployeeChange(event.target.value),
              disabled: loading
            }}
            // DSFR v1.26: Enhanced accessibility attributes
            options={employeeOptions}
          />
        </div>

        {/* Start Date */}
        <div className={cx(fr.cx("fr-col-md-4"))}>
          <Input
            label="Début"
            nativeInputProps={{
              type: "date",
              value: formatDateForInput(dateRange.start),
              onChange: handleStartDateChange,
              disabled: loading,
              // DSFR v1.26: Improved date input handling
              max: formatDateForInput(dateRange.end) || undefined
            }}
          />
        </div>

        {/* End Date */}
        <div className={cx(fr.cx("fr-col-md-4"))}>
          <Input
            label="Fin"
            nativeInputProps={{
              type: "date",
              value: formatDateForInput(dateRange.end),
              onChange: handleEndDateChange,
              disabled: loading,
              // DSFR v1.26: Improved date input handling
              min: formatDateForInput(dateRange.start) || undefined
            }}
          />
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className={cx(fr.cx("fr-grid-row"))}>
          <div className={cx(fr.cx("fr-col-12"))}>
            <div className={cx(fr.cx("fr-text--sm", "fr-text-mention--grey"))}>
              Chargement des données réglementaires...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Default props matching the expected structure from Figma designs
 */
RegulatoryThresholdsFilters.defaultProps = {
  selectedEmployee: "all",
  dateRange: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date() // Today
  },
  employeeList: [],
  loading: false,
  onEmployeeChange: () => {},
  onDateRangeChange: () => {}
};
