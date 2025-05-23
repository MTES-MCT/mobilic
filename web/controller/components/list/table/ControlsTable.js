import React from "react";
import { useIsWidthUp } from "common/utils/useWidth";

const ControlsTable = ({ entries, onRowClick, period = "day" }) => {
  const columns = React.useMemo(
    () => [
      { name: "employee", label: "Salarié" },
      { name: "vehicle", label: "Véhicule" },
      {
        name: "formattedTime",
        label: period === "day" ? "Heure" : "Date & Heure"
      },
      { name: "controlLocation", label: "Lieu contrôle" },
      { name: "type", label: "Type" },
      { name: "company", label: "Nom entreprise" },
      { name: "nbControlledDays", label: "Jours contrôlés" },
      { name: "nbReportedInfractions", label: "Infractions retenues" }
    ],
    [period]
  );
  const isMdUp = useIsWidthUp("md");
  return (
    <div
      className={`fr-table fr-table--bordered ${isMdUp &&
        "fr-table--layout-fixed"}`}
    >
      <table>
        <thead>
          <tr>
            {columns.map(({ name, label }) => (
              <th scope="col" key={`table_head__${name}`}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr
              style={{ cursor: "pointer" }}
              key={`table_row__${entry.id}`}
              onClick={() => onRowClick(entry.id, entry.type)}
            >
              {columns.map((column, idxColumn) => {
                return (
                  <td key={`table_row_${idxColumn}`}>{entry[column.name]}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ControlsTable;
