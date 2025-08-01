import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { isoFormatLocalDate } from "common/utils/time";
import { formatEmployeeName } from "./regulatoryThresholdConstants";

export default function RegulatoryThresholdsFilters({
  selectedEmployee = "all",
  onEmployeeChange = () => {},
  dateRange = {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  },
  onDateRangeChange = () => {},
  employeeList = [],
  loading = false
}) {
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

  return (
    <div className={cx(fr.cx("fr-container"))}>
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

      <div
        className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-4w"))}
      >
        <div className={cx(fr.cx("fr-col-md-4"))}>
          <Select
            label="Salarié(s)"
            nativeSelectProps={{
              value: selectedEmployee,
              onChange: event => onEmployeeChange(event.target.value),
              disabled: loading
            }}
          >
            <option value="all">Tous les salariés</option>
            {employeeList.map(employee => (
              <option key={employee.id} value={employee.id.toString()}>
                {formatEmployeeName(employee)}
              </option>
            ))}
          </Select>
        </div>

        <div className={cx(fr.cx("fr-col-md-4"))}>
          <Input
            label="Début"
            nativeInputProps={{
              type: "date",
              value: dateRange.start ? isoFormatLocalDate(dateRange.start) : "",
              onChange: handleStartDateChange,
              disabled: loading,
              max: dateRange.end ? isoFormatLocalDate(dateRange.end) : undefined
            }}
          />
        </div>

        <div className={cx(fr.cx("fr-col-md-4"))}>
          <Input
            label="Fin"
            nativeInputProps={{
              type: "date",
              value: dateRange.end ? isoFormatLocalDate(dateRange.end) : "",
              onChange: handleEndDateChange,
              disabled: loading,
              min: dateRange.start
                ? isoFormatLocalDate(dateRange.start)
                : undefined
            }}
          />
        </div>
      </div>

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
