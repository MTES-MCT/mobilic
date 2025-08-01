import React, { useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import RegulatoryThresholdsFilters from "./RegulatoryThresholdsFilters";
import RegulatoryThresholdsGrid from "./RegulatoryThresholdsGrid";

/**
 * RegulatoryThresholdsPanel - Pure DSFR v1.26 Main Container
 * Complete regulatory thresholds interface matching certificat_*_regulation.png
 * Integrates filters, grid layout, and data management
 */
export default function RegulatoryThresholdsPanel({
  companyWithInfo,
  className = ""
}) {
  // Filter state management
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date() // Today
  });

  // Loading state
  const [loading] = useState(false);

  // TODO: This will be replaced with the actual regulatory data hook
  // For now, using mock data structure
  const mockRegulatoryData = {
    regulationComputations: [
      {
        day: "2024-01-15",
        regulationComputations: [
          {
            regulationCheck: { type: "minimumDailyRest" },
            success: true,
            extra: { rest_duration_in_seconds: 43200 } // 12 hours
          },
          {
            regulationCheck: { type: "maximumWorkDayTime" },
            success: false,
            extra: { work_duration_in_seconds: 39600 } // 11 hours
          },
          {
            regulationCheck: { type: "enoughBreak" },
            success: true,
            extra: { break_duration_in_seconds: 2700 } // 45 minutes
          },
          {
            regulationCheck: { type: "maximumUninterruptedWorkTime" },
            success: true,
            extra: { uninterrupted_work_in_seconds: 18000 } // 5 hours
          },
          {
            regulationCheck: { type: "maximumWorkedDaysInWeek" },
            success: true,
            extra: { weekly_rest_in_seconds: 144000 } // 40 hours
          },
          {
            regulationCheck: { type: "maximumWorkInCalendarWeek" },
            success: false,
            extra: { work_duration_in_seconds: 172800 } // 48 hours
          }
        ]
      }
    ]
  };

  // Handle filter changes
  const handleEmployeeChange = employeeId => {
    setSelectedEmployee(employeeId);
    // TODO: Trigger data refetch with new employee filter
  };

  const handleDateRangeChange = newDateRange => {
    setDateRange(newDateRange);
    // TODO: Trigger data refetch with new date range
  };

  // Prepare employee list from company data
  const employeeList = companyWithInfo?.employees || [];

  // Check if regulatory data is available
  const hasRegulatoryData =
    mockRegulatoryData?.regulationComputations?.length > 0;

  return (
    <div className={cx(fr.cx("fr-container"), className)}>
      {/* Panel Header */}
      <div className={cx(fr.cx("fr-mb-4w"))}>
        <h3 className={cx(fr.cx("fr-h4", "fr-mb-2w"))}>
          Respect des seuils réglementaires
        </h3>
        <p className={cx(fr.cx("fr-text--sm", "fr-text-mention--grey"))}>
          Analyse détaillée du respect des seuils journaliers et hebdomadaires
          selon la réglementation du transport routier léger.
        </p>
      </div>

      {/* Filters Section */}
      <div className={cx(fr.cx("fr-mb-4w"))}>
        <RegulatoryThresholdsFilters
          selectedEmployee={selectedEmployee}
          onEmployeeChange={handleEmployeeChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          employeeList={employeeList}
          loading={loading}
        />
      </div>

      {/* Main Content */}
      {hasRegulatoryData ? (
        <RegulatoryThresholdsGrid
          regulatoryData={mockRegulatoryData}
          detailed={true}
          showSummary={true}
        />
      ) : (
        <NoRegulatoryDataMessage
          selectedEmployee={selectedEmployee}
          dateRange={dateRange}
          employeeList={employeeList}
        />
      )}

      {/* Additional Information */}
      <div className={cx(fr.cx("fr-mt-6w"))}>
        <RegulatoryInformationFooter />
      </div>
    </div>
  );
}

/**
 * No Regulatory Data Message
 * Displayed when no regulatory data is available for the selected filters
 */
function NoRegulatoryDataMessage({
  selectedEmployee,
  dateRange,
  employeeList
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

  return (
    <div className={cx(fr.cx("fr-alert", "fr-alert--info"))}>
      <h4 className={cx(fr.cx("fr-alert__title"))}>
        Aucune donnée réglementaire disponible
      </h4>
      <div className={cx(fr.cx("fr-mb-3w"))}>
        <p>
          Aucune donnée sur les seuils réglementaires n'est disponible pour les
          critères suivants :
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
        <p className={cx(fr.cx("fr-text--bold", "fr-mb-1w"))}>Suggestions :</p>
        <ul className={cx(fr.cx("fr-mb-0"))}>
          <li>Vérifiez que des activités ont été saisies pour cette période</li>
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

/**
 * Regulatory Information Footer
 * Additional context and legal information about regulatory thresholds
 */
function RegulatoryInformationFooter() {
  return (
    <div className={cx(fr.cx("fr-notice", "fr-notice--info"))}>
      <div className={cx(fr.cx("fr-container"))}>
        <div className={cx(fr.cx("fr-notice__body"))}>
          <h5 className={cx(fr.cx("fr-notice__title"))}>
            À propos des seuils réglementaires
          </h5>
          <p className={cx(fr.cx("fr-notice__desc"))}>
            Les seuils réglementaires sont calculés selon la réglementation
            française du transport routier léger en vigueur. Ces calculs
            prennent en compte le type d'activité déclaré pour chaque salarié et
            les spécificités de votre secteur d'activité.
          </p>
          <div className={cx(fr.cx("fr-mt-2w"))}>
            <h6 className={cx(fr.cx("fr-text--sm", "fr-text--bold"))}>
              Sources réglementaires :
            </h6>
            <ul className={cx(fr.cx("fr-text--sm", "fr-mb-0"))}>
              <li>Règlement (CE) n° 561/2006 du Parlement européen</li>
              <li>Code des transports français</li>
              <li>Décret n° 2007-1340 du 11 septembre 2007</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default props
RegulatoryThresholdsPanel.defaultProps = {
  companyWithInfo: {},
  className: ""
};
