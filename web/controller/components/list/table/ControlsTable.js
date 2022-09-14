import React from "react";
import { useIsWidthUp } from "common/utils/useWidth";

const columns = [
  { name: "company", label: "Nom entreprise" },
  { name: "employee", label: "Salarié" },
  { name: "vehicle", label: "Véhicule" },
  { name: "time", label: "Heure" },
  { name: "type", label: "Type" },
  { name: "nbControlledDays", label: "Jours contrôlés" }
];

const ControlsTable = ({ entries, onRowClick }) => {
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
              key={`table_row__${entry.id}`}
              onClick={() => onRowClick(entry.id)}
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
