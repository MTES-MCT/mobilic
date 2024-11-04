import React from "react";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { TextWithOverflowTooltip } from "./TextWithOverflowTooltip";

export function AugmentedTableRowCellContent({
  column,
  cellData,
  rowData,
  adding,
  editing,
  setCellData
}) {
  if (adding || editing) {
    if (column.renderEditMode)
      return column.renderEditMode(cellData, rowData, setCellData, adding);
    if (column.boolean)
      return (
        <Checkbox
          size="small"
          checked={cellData || false}
          onChange={e => setCellData(e.target.checked)}
        />
      );
    return (
      <TextField
        fullWidth
        size="small"
        label={column.label}
        value={cellData || ""}
        onChange={e => {
          setCellData(e.target.value);
        }}
      />
    );
  }

  const CellInnerComponent = column.overflowTooltip
    ? TextWithOverflowTooltip
    : React.Fragment;
  const cellInnerComponentProps = column.overflowTooltip
    ? {
        text: column.formatTooltipContent
          ? column.formatTooltipContent(cellData, rowData)
          : null,
        alwaysShow: column.alwaysShowTooltip
      }
    : {};
  return (
    <CellInnerComponent {...cellInnerComponentProps}>
      {column.boolean ? (
        <Checkbox
          color="secondary"
          size="small"
          checked={cellData || false}
          disabled
        />
      ) : column.format ? (
        <span>{column.format(cellData, rowData)}</span>
      ) : cellData ? (
        <span>{cellData}</span>
      ) : null}
    </CellInnerComponent>
  );
}

export function AugmentedTableRow({
  columns,
  entry,
  isAddingRow,
  isEditingRow,
  renderRow,
  renderRowContainer,
  renderCell,
  renderCellContainer,
  rowClassName,
  onRowClick
}) {
  function renderColumn(column) {
    return renderCellContainer(
      column,
      renderCell(entry, column, isAddingRow, isEditingRow)
    );
  }

  return renderRowContainer({
    className: rowClassName,
    ...(onRowClick && {
      role: "button",
      tabIndex: "0",
      onKeyDown: event => {
        if (
          event.key === "Enter" &&
          event.target.tagName !== "A" &&
          event.target.tagName !== "BUTTON"
        ) {
          onRowClick(entry);
        }
      }
    }),
    onClick: onRowClick,
    children: renderRow({
      entry,
      columns,
      renderColumn,
      isAddingRow,
      isEditingRow
    })
  });
}
