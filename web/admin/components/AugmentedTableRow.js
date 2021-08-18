import React from "react";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import TextField from "@material-ui/core/TextField/TextField";
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
          color="primary"
          onChange={e => setCellData(e.target.checked)}
        />
      );
    return (
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label={column.label}
        value={cellData || ""}
        onChange={e => {
          console.log(e.target.value);
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
        <Checkbox size="small" checked={cellData || false} disabled />
      ) : column.format ? (
        <span>{column.format(cellData, rowData)}</span>
      ) : cellData ? (
        <span>{cellData}</span>
      ) : null}
    </CellInnerComponent>
  );
}

export const AugmentedTableRow = React.memo(
  ({
    columns,
    id,
    entry,
    isAddingRow,
    isEditingRow,
    renderRow,
    renderRowContainer,
    renderCell,
    renderCellContainer,
    rowClassName,
    onRowClick,
    rowWidth
  }) => {
    function renderColumn(column) {
      return renderCellContainer(
        column,
        renderCell(entry, column, isAddingRow, isEditingRow)
      );
    }

    return renderRowContainer({
      className: rowClassName,
      onClick: onRowClick,
      children: renderRow({
        entry,
        columns,
        renderColumn,
        isAddingRow,
        isEditingRow
      })
    });
  },
  (prevProps, props) => {
    if (prevProps.id !== props.id) return false;
    if (prevProps.rowWidth !== props.rowWidth) return false;
    if (prevProps.rowClassName !== props.rowClassName) return false;
    if (prevProps.isEditingRow !== props.isEditingRow) return false;
    if (prevProps.isAddingRow !== props.isAddingRow) return false;
    if (prevProps.isEditingRow || prevProps.isAddingRow) return false;
    return true;
  }
);
