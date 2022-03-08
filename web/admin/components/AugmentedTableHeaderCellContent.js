import React from "react";
import TableSortLabel from "@mui/material/TableSortLabel";

export function AugmentedTableHeaderCellContent({
  column,
  onSortTypeChange,
  sorted,
  desc
}) {
  if (column.sortable)
    return (
      <TableSortLabel
        active={sorted}
        direction={sorted ? desc : "desc"}
        onClick={onSortTypeChange(column.name)}
        style={{
          flexDirection: column.align === "right" ? "row-reverse" : "row"
        }}
        hideSortIcon={false}
      >
        {column.renderLabel ? column.renderLabel() : column.label}
      </TableSortLabel>
    );

  return (
    <span>{column.renderLabel ? column.renderLabel() : column.label}</span>
  );
}
