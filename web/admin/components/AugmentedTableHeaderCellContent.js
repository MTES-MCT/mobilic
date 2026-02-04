import React from "react";
import Box from "@mui/material/Box";

function SortIcon({ sorted, desc, alwaysShow }) {
  if (!sorted) {
    if (!alwaysShow) return null;
    return (
      <span
        className="fr-icon-arrow-up-down-line fr-icon--sm"
        aria-hidden="true"
        style={{ color: "var(--text-action-high-blue-france)" }}
      />
    );
  }
  if (desc === "asc") {
    return (
      <span
        className="fr-icon-arrow-up-s-line fr-icon--sm"
        aria-hidden="true"
        style={{ color: "var(--text-action-high-blue-france)" }}
      />
    );
  }
  return (
    <span
      className="fr-icon-arrow-down-s-line fr-icon--sm"
      aria-hidden="true"
      style={{ color: "var(--text-action-high-blue-france)" }}
    />
  );
}

export function AugmentedTableHeaderCellContent({
  column,
  onSortTypeChange,
  sorted,
  desc
}) {
  if (column.sortable)
    return (
      <Box
        component="span"
        onClick={onSortTypeChange(column.propertyForSorting || column.name)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          flexDirection: column.align === "right" ? "row-reverse" : "row"
        }}
      >
        {column.renderLabel ? column.renderLabel() : column.label}
        <SortIcon
          sorted={sorted}
          desc={desc}
          alwaysShow={column.alwaysShowSortIcon}
        />
      </Box>
    );

  return (
    <span>{column.renderLabel ? column.renderLabel() : column.label}</span>
  );
}
