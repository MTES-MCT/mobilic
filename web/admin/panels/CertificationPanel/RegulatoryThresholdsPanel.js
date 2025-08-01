import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import RegulatoryThresholdsFilters from "./RegulatoryThresholdsFilters";
import RegulatoryThresholdsGrid from "./RegulatoryThresholdsGrid";
import { useRegulatoryThresholds } from "../../utils/regulatoryThresholds";

export default function RegulatoryThresholdsPanel({
  companyWithInfo = {},
  className = ""
}) {
  const {
    selectedEmployee,
    setSelectedEmployee,
    dateRange,
    setDateRange,
    rawRegulatoryData,
    employees,
    loading,
    error,
    refreshData,
    hasData
  } = useRegulatoryThresholds(companyWithInfo?.id);

  const employeeList =
    employees.length > 0 ? employees : companyWithInfo?.employees || [];

  const regulatoryDataForGrid = rawRegulatoryData;

  // console.log("RegulatoryThresholdsPanel Debug:", {
  //   companyId: companyWithInfo?.id,
  //   employeeList: employeeList.length,
  //   hasData,
  //   loading,
  //   error,
  //   rawRegulatoryData
  // });

  return (
    <div className={cx(fr.cx("fr-container"), className)}>
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className={cx(fr.cx("fr-alert", "fr-alert--info", "fr-mb-2w"))}>
          <p className={cx(fr.cx("fr-text--sm"))}>
            Debug: Company ID: {companyWithInfo?.id}, Employees:{" "}
            {employeeList.length}, HasData: {hasData ? "Yes" : "No"}
          </p>
        </div>
      )}

      {error && (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <div className={cx(fr.cx("fr-alert", "fr-alert--error"))}>
            <h4 className={cx(fr.cx("fr-alert__title"))}>
              Erreur de chargement des données
            </h4>
            <p className={cx(fr.cx("fr-mb-2w"))}>
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

      <div className={cx(fr.cx("fr-mb-4w"))}>
        <RegulatoryThresholdsFilters
          selectedEmployee={selectedEmployee}
          onEmployeeChange={setSelectedEmployee}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          employeeList={employeeList}
          loading={loading}
        />
      </div>

      {!hasData ? (
        <NoRegulatoryDataMessage
          selectedEmployee={selectedEmployee}
          dateRange={dateRange}
          employeeList={employeeList}
          loading={loading}
        />
      ) : (
        <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
          <div className={cx(fr.cx("fr-col-md-6"))}>
            <h3 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
              Seuils journaliers
            </h3>
            <RegulatoryThresholdsGrid
              regulatoryData={regulatoryDataForGrid}
              detailed={true}
              showSummary={false}
              showOnlyDaily={true}
            />
          </div>

          <div className={cx(fr.cx("fr-col-md-6"))}>
            <h3 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
              Seuils hebdomadaires
            </h3>
            <RegulatoryThresholdsGrid
              regulatoryData={regulatoryDataForGrid}
              detailed={true}
              showSummary={false}
              showOnlyWeekly={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NoRegulatoryDataMessage({
  selectedEmployee = "all",
  dateRange = { start: null, end: null },
  employeeList = [],
  loading = false
}) {
  const selectedEmployeeName =
    selectedEmployee === "all"
      ? "tous les salariés"
      : employeeList.find(emp => emp.id.toString() === selectedEmployee)
          ?.firstName +
          " " +
          employeeList.find(emp => emp.id.toString() === selectedEmployee)
            ?.lastName || "l'employé sélectionné";

  const formatDate = date => {
    return date ? date.toLocaleDateString("fr-FR") : "Non définie";
  };

  if (!loading) {
    return (
      <div className={cx(fr.cx("fr-alert", "fr-alert--info"))}>
        <h4 className={cx(fr.cx("fr-alert__title"))}>
          Aucune donnée réglementaire disponible
        </h4>
        <div className={cx(fr.cx("fr-mb-3w"))}>
          <p>
            Aucune donnée sur les seuils réglementaires n'est disponible pour
            les critères suivants :
          </p>
          <ul className={cx(fr.cx("fr-mb-2w"))}>
            <li>
              <strong>Salarié(s) :</strong> {selectedEmployeeName}
            </li>
            <li>
              <strong>Période :</strong> du {formatDate(dateRange.start)} au{" "}
              {formatDate(dateRange.end)}
            </li>
          </ul>
        </div>

        <div className={cx(fr.cx("fr-highlight"))}>
          <p className={cx(fr.cx("fr-text--bold", "fr-mb-1w"))}>
            Suggestions :
          </p>
          <ul className={cx(fr.cx("fr-mb-0"))}>
            <li>
              Vérifiez que des activités ont été saisies pour cette période
            </li>
            <li>Essayez d'élargir la période de recherche</li>
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
}
